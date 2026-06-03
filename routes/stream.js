const router = require('express').Router();
const { extractAsCdnStream } = require('../utils/extractor');

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
    const masterUrl = await extractAsCdnStream(id);
    if (!masterUrl) {
      return res.status(404).json({ success: false, error: 'No stream URL found' });
    }

    res.json({
      success: true,
      video_id: id,
      master_url: masterUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
