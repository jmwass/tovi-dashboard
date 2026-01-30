module.exports = (req, res) => {
  res.status(200).json({
    hasAccessToken: !!process.env.META_ACCESS_TOKEN,
    hasAdAccountId: !!process.env.META_AD_ACCOUNT_ID,
    adAccountId: process.env.META_AD_ACCOUNT_ID ? 'Set' : 'Missing'
  });
};
