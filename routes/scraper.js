const router = require('express').Router();

router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url param required' });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': url,
      }
    });

    const text = await response.text();

    // Extract all URLs from response
    const urls = [...text.matchAll(/https?:\/\/[^\s"'<>]+/g)].map(m => m[0]);

    // Extract m3u8 / mp4 / video sources specifically
    const videoUrls = urls.filter(u =>
      u.includes('.m3u8') ||
      u.includes('.mp4') ||
      u.includes('.ts') ||
      u.includes('stream') ||
      u.includes('video') ||
      u.includes('cdn')
    );

    res.json({
      total_urls: urls.length,
      video_urls: [...new Set(videoUrls)],
      all_urls: [...new Set(urls)].slice(0, 100),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
