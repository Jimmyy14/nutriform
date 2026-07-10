// Vercel serverless function — приема имейл от export-гейта (freemium lead capture).
// По желание препраща към webhook, зададен в env var LEAD_WEBHOOK
// (напр. Google Apps Script URL, Zapier/Make webhook, или собствен endpoint).
// Докато LEAD_WEBHOOK липсва — само логва и връща ok, за да не чупи UX.
//
// ЗАЩИТА (както при api/claude.js и api/usda.js): само заявки от собствения
// сайт + лек rate-limit на IP, за да не пълнят логовете/webhook-а с боклук.

const WINDOW_SEC = 60;
const MAX_PER_IP = 5; // един човек праща имейл веднъж; 5/мин е предостатъчно
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_SEC * 1000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > MAX_PER_IP;
}

function originAllowed(req) {
  const host = req.headers.host || '';
  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')).filter(Boolean);
  const hostOf = (u) => { try { return new URL(u).host; } catch { return ''; } };
  const check = (u) => { const h = hostOf(u); return h && (h === host || extra.includes(h)); };
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  if (origin) return check(origin);
  if (referer) return check(referer);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!originAllowed(req)) { res.status(403).json({ error: 'Forbidden origin' }); return; }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) { res.setHeader('Retry-After', String(WINDOW_SEC)); res.status(429).json({ error: 'Too many requests' }); return; }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    body = body || {};
    const email = (body.email ? String(body.email) : '').trim().slice(0, 254);
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
