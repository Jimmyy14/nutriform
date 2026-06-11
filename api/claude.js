// Vercel serverless function — proxy към Anthropic API
// Ключът стои в environment variable ANTHROPIC_API_KEY (никога в кода!)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({error: 'Method not allowed'}); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({error: 'Server misconfigured: no API key'});
    return;
  }

  // Прост rate limit: максимална дължина на prompt-а
  const body = req.body;
  if (!body || !body.messages || JSON.stringify(body).length > 20000) {
    res.status(400).json({error: 'Invalid request'});
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model: 'claude-sonnet-4-6',
        max_tokens: Math.min(body.max_tokens || 1000, 1500),
        messages: body.messages
      })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
}
