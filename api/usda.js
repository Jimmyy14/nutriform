// Vercel serverless function — прокси към USDA FoodData Central търсене.
// Ключът стои в environment variable USDA_API_KEY (вземи безплатен от
// https://fdc.nal.usda.gov/api-key-signup.html). Ако липсва → ползва публичния
// DEMO_KEY (работи, но е силно ограничен), така че приложението върви и без настройка.

// Лек in-memory rate-limit на заявка (за да не изчерпваме нашия USDA ключ)
const WINDOW_SEC = 60;
const MAX_PER_IP = 40;
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
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  if (!originAllowed(req)) { res.status(403).json({ error: 'Forbidden origin' }); return; }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) { res.setHeader('Retry-After', String(WINDOW_SEC)); res.status(429).json({ error: 'Too many requests' }); return; }

  const q = (req.query.query || '').toString().slice(0, 100);
  if (!q || q.length < 2) { res.status(400).json({ error: 'Invalid query' }); return; }

  const key = process.env.USDA_API_KEY || 'DEMO_KEY';
  try {
    const r = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&pageSize=8&api_key=${key}`
    );
    const data = await r.json();
    // кешираме за кратко на edge-а
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
