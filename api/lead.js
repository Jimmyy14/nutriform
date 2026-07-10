// Vercel serverless function — приема имейл от export-гейта (freemium lead capture).
// По желание препраща към webhook, зададен в env var LEAD_WEBHOOK
// (напр. Google Apps Script URL, Zapier/Make webhook, или собствен endpoint).
// Докато LEAD_WEBHOOK липсва — само логва и връща ok, за да не чупи UX.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    body = body || {};
    const email = (body.email ? String(body.email) : '').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) { res.status(400).json({ error: 'Invalid email' }); return; }

    const lead = {
      email,
      product: (body.product || '').toString().slice(0, 200),
      lang: (body.lang || '').toString().slice(0, 5),
      ts: body.ts || new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || '',
    };

    console.log('NEW LEAD:', JSON.stringify(lead));

    const hook = process.env.LEAD_WEBHOOK;
    if (hook) {
      await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      }).catch((e) => console.error('LEAD_WEBHOOK error:', e));
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('lead endpoint error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}
