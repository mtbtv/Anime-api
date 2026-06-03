const express = require('express');
const cors = require('cors');
const healthRouter = require('./routes/health');
const animeRouter = require('./routes/anime');
const scraperRouter = require('./routes/scraper');
const streamRoute = require('./routes/stream');


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/anime', animeRouter);
app.use('/api/urlscraper', scraperRouter);
app.use('/api/stream', streamRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
