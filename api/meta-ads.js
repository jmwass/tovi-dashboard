module.exports = async function handler(req, res) {
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

    const today = new Date();
    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(today.getDate() - 7);
    
    const previous7DaysStart = new Date(today);
    previous7DaysStart.setDate(today.getDate() - 14);
    const previous7DaysEnd = new Date(today);
    previous7DaysEnd.setDate(today.getDate() - 7);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const thisWeekUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights?access_token=${accessToken}&time_range={"since":"${formatDate(last7DaysStart)}","until":"${formatDate(today)}"}&fields=spend,clicks,impressions,actions,cpc,cpm,ctr`;
    
    const lastWeekUrl = `https://graph.facebook.com/v
