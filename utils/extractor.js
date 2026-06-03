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
        'Origin': 'https://as-cdn21.top',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
    },
    10000
  );

  const data = await res.json();

  if (!data?.videoSource) return null;

  return {
    url: data.videoSource,
    headers: {
      'Referer': 'https://as-cdn21.top/',
      'Origin': 'https://as-cdn21.top',
      'User-Agent': UA,
    },
    proxy_url: `/api/proxy?url=${encodeURIComponent(data.videoSource)}`,
  };
}

// ── Proxy m3u8 (rewrites segment URLs + injects headers) ─────────────────────
async function proxyM3u8(masterUrl) {
  // Extract the CDN base from the URL to use as referer
  const urlObj = new URL(masterUrl);
  const cdnOrigin = `${urlObj.protocol}//${urlObj.hostname}`;

  const res = await fetchWithTimeout(masterUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': cdnOrigin + '/',
      'Origin': cdnOrigin,
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'Connection': 'keep-alive',
    }
  }, 10000);

  if (!res.ok) throw new Error(`Failed to fetch m3u8: ${res.status}`);

  const text = await res.text();
  const base = masterUrl.substring(0, masterUrl.lastIndexOf('/') + 1);

  // Rewrite relative URLs to absolute
  const rewritten = text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      if (trimmed.startsWith('http')) return trimmed;
      return base + trimmed;
    })
    .join('\n');

  return rewritten;
}

module.exports = { extractAsCdnStream, proxyM3u8, fetchWithTimeout, UA, BASE_URL };  );

  const data = await res.json();

  if (!data?.videoSource) return null;

  // Return URL + required playback headers
  return {
    url: data.videoSource,
    headers: {
      'Referer': 'https://as-cdn21.top/',
      'Origin': 'https://as-cdn21.top',
      'User-Agent': UA,
    },
    proxy_url: `/proxy?url=${encodeURIComponent(data.videoSource)}`,
  };
}

// ── Proxy m3u8 (rewrites segment URLs + injects headers) ─────────────────────
async function proxyM3u8(masterUrl) {
  const res = await fetchWithTimeout(masterUrl, {
    headers: {
      'Referer': 'https://as-cdn21.top/',
      'Origin': 'https://as-cdn21.top',
      'User-Agent': UA,
    }
  }, 10000);

  if (!res.ok) throw new Error(`Failed to fetch m3u8: ${res.status}`);

  const text = await res.text();
  const base = masterUrl.substring(0, masterUrl.lastIndexOf('/') + 1);

  // Rewrite relative URLs to absolute
  const rewritten = text
    .split('\n')
    .map(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return line;
      if (line.startsWith('http')) return line;
      return base + line;
    })
    .join('\n');

  return rewritten;
}

module.exports = { extractAsCdnStream, proxyM3u8, fetchWithTimeout, UA, BASE_URL };
