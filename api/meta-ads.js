module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;

    // Simple test call to Meta API
    const testUrl = `https://graph.facebook.com/v18.0/${adAccountId}?access_token=${accessToken}&fields=name,account_id`;
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      metaResponse: data
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
