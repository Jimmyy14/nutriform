// Vercel serverless function — proxy към Anthropic API
// Ключът стои в environment variable ANTHROPIC_API_KEY (никога в кода!)
//
// ЗАЩИТА срещу злоупотреба с твоя Anthropic кредит:
//   1. Проверка за произход — само заявки от собствения сайт.
//   2. Rate-limit с Upstash Redis — N заявки/минута на IP (надеждно, през всички инстанции).
//   3. Резервен in-memory лимит — ако Redis е недостъпен.
//   4. Лимит на размера на заявката + таван на max_tokens.
//
// За да активираш Redis лимита, добави във Vercle → Settings → Environment Variables:
//   UPSTASH_REDIS_REST_URL   и   UPSTASH_REDIS_REST_TOKEN
// Докато ги няма, проксито работи нормално, но само с резервния in-memory лимит ("fail-open").

// ─── Настройки на лимита ──────────────────────────────────────────────────────
const WINDOW_SEC = 60;   // прозорец в секунди
const MAX_PER_IP = 15;   // макс. заявки на IP в рамките на прозореца

// ─── Резервен in-memory лимит (per warm instance, груб) ───────────────────────
const memHits = new Map(); // ip -> [timestamps в ms]
function memRateLimited(ip) {
  const now = Date.now();
  const arr = (memHits.get(ip) || []).filter(t => now - t < WINDOW_SEC * 1000);
  arr.push(now);
  memHits.set(ip, arr);
  if (memHits.size > 5000) memHits.clear(); // лека чистка срещу разрастване на паметта
  return arr.length > MAX_PER_IP;
}

// ─── Upstash Redis лимит (надежден, през REST API — без npm пакети) ───────────
// Връща: {ok: true/false} или {skipped: true} ако Redis не е конфигуриран/недостъпен.
async function redisRateLimited(ip) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { skipped: true };

  const bucket = Math.floor(Date.now() / (WINDOW_SEC * 1000));
  const key = `nf:rl:${ip}:${bucket}`;
  try {
    // Атомарно: INCR брояча и сложи срок на живот на ключа.
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(WINDOW_SEC)]]),
    });
    if (!res.ok) return { skipped: true };
    const data = await res.json();
    const count = Number(data?.[0]?.result ?? 0);
    return { ok: count <= MAX_PER_IP, count };
  } catch (e) {
    return { skipped: true }; // при грешка в Redis — не блокирай (резервният лимит важи)
  }
}

// ─── Проверка за произход — само заявки от собствения сайт ─────────────────────
// Фронтендът вика /api/claude относително, така че Origin/Referer сочат към собствения хост.
// Можеш да зададеш и изрични домейни през ALLOWED_ORIGINS (разделени със запетая).
function originAllowed(req) {
  const host = req.headers.host || '';
  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')).filter(Boolean);
  const hostOf = (u) => { try { return new URL(u).host; } catch { return ''; } };
  const check = (u) => {
    const h = hostOf(u);
    return h && (h === host || extra.includes(h));
  };
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  // Ако има Origin — изисквай съвпадение. Иначе провери Referer.
  if (origin) return check(origin);
  if (referer) return check(referer);
  return false; // нито Origin, нито Referer → подозрителна (напр. raw curl) → блокирай
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  // 1) Произход — само от собствения сайт
  if (!originAllowed(req)) {
    res.status(403).json({ error: 'Forbidden: invalid origin' });
    return;
  }

  // 2) Rate-limit по IP (Redis → ако е недостъпен, резервен in-memory)
  const ip = clientIp(req);
  const redis = await redisRateLimited(ip);
  const limited = redis.skipped ? memRateLimited(ip) : !redis.ok;
  if (limited) {
    res.setHeader('Retry-After', String(WINDOW_SEC));
    res.status(429).json({ error: 'Too many requests. Изчакай минута и опитай пак.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server misconfigured: no API key' });
    return;
  }

  // 3) Размер на заявката
  const body = req.body;
  if (!body || !body.messages || JSON.stringify(body).length > 20000) {
    res.status(400).json({ error: 'Invalid request' });
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
        model: 'claude-sonnet-4-6',
        max_tokens: Math.min(body.max_tokens || 1000, 1500),
        messages: body.messages
      })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
