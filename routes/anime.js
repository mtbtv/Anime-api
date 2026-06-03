const router = require('express').Router();

// GET all anime (example static data, swap with DB/API)
router.get('/', async (req, res) => {
  try {
    const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch anime' });
  }
});

// GET single anime by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${req.params.id}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch anime' });
  }
});

module.exports = router;
