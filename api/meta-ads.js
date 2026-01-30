export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;

    if (!accessToken || !adAccountId) {
      return res.status(500).json({ error: 'Missing Meta credentials' });
    }

    // Get last 7 days and previous 7 days for comparison
    const today = new Date();
    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(today.getDate() - 7);
    const last7DaysEnd = today;
    
    const previous7DaysStart = new Date(today);
    previous7DaysStart.setDate(today.getDate() - 14);
    const previous7DaysEnd = new Date(today);
    previous7DaysEnd.setDate(today.getDate() - 7);

    const formatDate = (date) => date.toISOString().split('T')[0];

    // Fetch this week's data
    const thisWeekUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights?access_token=${accessToken}&time_range={\"since\":\"${formatDate(last7DaysStart)}\",\"until\":\"${formatDate(last7DaysEnd)}\"}&fields=spend,clicks,impressions,actions,cpc,cpm,ctr`;
    
    // Fetch last week's data
    const lastWeekUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights?access_token=${accessToken}&time_range={\"since\":\"${formatDate(previous7DaysStart)}\",\"until\":\"${formatDate(previous7DaysEnd)}\"}&fields=spend,clicks,impressions,actions,cpc,cpm,ctr`;

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
      const conversions = ins
