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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt + "\n\n" + dataPrompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Transform Gemini response to match expected format
    const transformedData = {
      content: [{
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'
      }]
    };
    
    return res.status(200).json(transformedData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
