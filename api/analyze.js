export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { systemPrompt, dataPrompt } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        content: [{ text: 'ERROR: GEMINI_API_KEY not configured' }]
      });
    }

    const fullPrompt = systemPrompt + "\n\n" + dataPrompt;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ 
        content: [{ text: `Gemini API Error (${response.status}): ${errorText}` }]
      });
    }

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ 
        content: [{ text: `Gemini Error: ${JSON.stringify(data.error)}` }]
      });
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(500).json({ 
        content: [{ text: `No text in response. Full response: ${JSON.stringify(data)}` }]
      });
    }
    
    return res.status(200).json({
      content: [{ text: text }]
    });
    
  } catch (error) {
    return res.status(500).json({ 
      content: [{ text: `Server Error: ${error.message}` }]
    });
  }
}
