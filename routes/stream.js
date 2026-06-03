const router = require('express').Router();
const { extractAsCdnStream, proxyM3u8 } = require('../utils/extractor');

// GET /stream?id=ee25f924b7df4d4fb93b3da96ee342b1
router.get('/', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      error: 'id param required',
      example: '/stream?id=ee25f924b7df4d4fb93b3da96ee342b1',
    });
  }

  try {
    const stream = await extractAsCdnStream(id);
    if (!stream) {
      return res.status(404).json({ success: false, error: 'No stream URL found' });
    }

    res.json({
      success: true,
      video_id: id,
      master_url: stream.url,
      proxy_url: stream.proxy_url,
      headers: stream.headers,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /stream/proxy?url=https://as-cdn21.top/cdn/hls/.../master.m3u8
// Use this endpoint in your player instead of direct URL
router.get('/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url param required' });

  try {
    const m3u8 = await proxyM3u8(decodeURIComponent(url));

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(m3u8);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
