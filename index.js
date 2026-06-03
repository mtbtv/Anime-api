const express = require('express');
const cors = require('cors');
const healthRouter = require('./routes/health');
const animeRouter = require('./routes/anime');
const scraperRouter = require('./routes/scraper');
const streamRoute = require('./routes/stream');
const { proxyM3u8 } = require('./utils/extractor');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/anime', animeRouter);
app.use('/api/urlscraper', scraperRouter);
app.use('/api/stream', streamRoute);

// GET /api/proxy?url=https://as-cdn21.top/cdn/hls/.../master.m3u8
app.get('/api/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({
      error: 'url param required',
      example: '/api/proxy?url=https://as-cdn21.top/cdn/hls/.../master.m3u8',
    });
  }

  try {
    const m3u8 = await proxyM3u8(decodeURIComponent(url));
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(m3u8);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
