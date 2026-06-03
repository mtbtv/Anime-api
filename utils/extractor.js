const BASE_URL = 'https://animelok.to';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ── Fetch with timeout ────────────────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(t);
    return res;
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

// ── Extract master stream URL from as-cdn ─────────────────────────────────────
async function extractAsCdnStream(videoId) {
  const embedUrl = `https://as-cdn21.top/video/${videoId}`;
  const apiUrl = `https://as-cdn21.top/player/index.php?data=${videoId}&do=getVideo`;

  const res = await fetchWithTimeout(
    apiUrl,
    {
      method: 'POST',
      body: `hash=${videoId}&r=${encodeURIComponent(BASE_URL)}/`,
      headers: {
        'User-Agent': UA,
        'Referer': embedUrl,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    10000
  );

  const data = await res.json();
  return data?.videoSource || null;
}

module.exports = { extractAsCdnStream, fetchWithTimeout, UA, BASE_URL };
