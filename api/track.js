// Vercel serverless function — анонимен брояч за фунията.
//
// Защо не Vercel Analytics: на Hobby план дава само брой посещения, а
// собствените събития (label_view, export_click…) са платени. Тук ползваме
// Upstash Redis, който вече е свързан за api/claude.js.
//
// НЕ пази нищо лично: без IP, без имейл, без бисквитки, без идентификатор на
// човек. Само числа: колко пъти се е случило събитието — общо и по дни.
// Четеш ги в Upstash → Data Browser, ключове `nf:stat:*`.

const ALLOWED_EVENTS = new Set([
  'lp_view',       // отвори landing страницата
  'app_open',      // отвори приложението (след избор на език)
  'label_view',    // стигна до таб „Етикет"
  'export_click',  // натисна печат/PDF
  'lead_submit',   // остави имейл
]);

const WINDOW_SEC = 60;
const MAX_PER_IP = 30;
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
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!originAllowed(req)) { res.status(403).json({ error: 'Forbidden origin' }); return; }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) { res.status(429).json({ error: 'Too many requests' }); return; }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    body = body || {};
    const event = String(body.event || '');
    if (!ALLOWED_EVENTS.has(event)) { res.status(400).json({ error: 'Unknown event' }); return; }

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) { res.status(200).json({ ok: true, skipped: 'no-redis' }); return; }

    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', `nf:stat:${event}`],            // общо за всички времена
        ['INCR', `nf:stat:${event}:${day}`],     // по дни
        ['EXPIRE', `nf:stat:${event}:${day}`, '7776000'], // дневните мрат след 90 дни
      ]),
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('track error:', e);
    res.status(200).json({ ok: true, skipped: 'error' }); // аналитиката никога не чупи UX
  }
}
