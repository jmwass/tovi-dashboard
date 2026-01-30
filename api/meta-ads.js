module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;

    if (!accessToken || !adAccountId) {
      return res.status(500).json({ error: 'Missing credentials' });
    }

    const today = new Date();
    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(today.getDate() - 7);
    
    const previous7DaysStart = new Date(today);
    previous7DaysStart.setDate(today.getDate() - 14);
    const previous7DaysEnd = new Date(today);
    previous7DaysEnd.setDate(today.getDate() - 7);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const thisWeekUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights?access_token=${accessToken}&time_range={"since":"${formatDate(last7DaysStart)}","until":"${formatDate(today)}"}&fields=spend,clicks,impressions,actions,cpc,cpm,ctr`;
    
    const lastWeekUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights?access_token=${accessToken}&time_range={"since":"${formatDate(previous7DaysStart)}","until":"${formatDate(previous7DaysEnd)}"}&fields=spend,clicks,impressions,actions,cpc,cpm,ctr`;

    const [thisWeekResponse, lastWeekResponse] = await Promise.all([
      fetch(thisWeekUrl),
      fetch(lastWeekUrl)
    ]);

    const thisWeekData = await thisWeekResponse.json();
    const lastWeekData = await lastWeekResponse.json();

    if (thisWeekData.error) {
      return res.status(500).json({ error: thisWeekData.error.message });
    }

    const processData = (data) => {
      if (!data.data || data.data.length === 0) {
        return { spend: 0, clicks: 0, impressions: 0, conversions: 0, ctr: 0, cpc: 0, cpa: 0, roas: 0 };
      }

      const insights = data.data[0];
      const conversions = insights.actions?.find(a => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value || 0;
      const spend = parseFloat(insights.spend || 0);
      const clicks = parseInt(insights.clicks || 0);
      const impressions = parseInt(insights.impressions || 0);
      const ctr = parseFloat(insights.ctr || 0);
      const cpc = parseFloat(insights.cpc || 0);
      const cpa = conversions > 0 ? spend / conversions : 0;
      const roas = conversions > 0 ? (conversions * 100) / spend : 0;

      return {
        spend: Math.round(spend),
        clicks,
        impressions,
        conversions: parseInt(conversions),
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        cpa: parseFloat(cpa.toFixed(2)),
        roas: parseFloat(roas.toFixed(1))
      };
    };

    return res.status(200).json({
      thisWeek: processData(thisWeekData),
      lastWeek: processData(lastWeekData)
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
