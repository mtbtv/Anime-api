// routes/scraper.js
const router = require('express').Router();
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url param required' });

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  const requests = [];

  page.on('request', req => {
    if (['fetch', 'xhr'].includes(req.resourceType())) {
      requests.push({ url: req.url(), method: req.method() });
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  await browser.close();

  res.json(requests);
});

module.exports = router;
