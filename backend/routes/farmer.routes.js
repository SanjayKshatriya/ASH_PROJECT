// Farmer Routes
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

// GET /api/farmers — List all farmers (Admin)
router.get('/', auth, async (req, res) => {
  try {
    res.json({ success: true, data: [], total: 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/farmers/:id — Get farmer profile
router.get('/:id', auth, async (req, res) => {
  res.json({ success: true, data: { id: req.params.id, name: 'Ramu Kumar' } });
});

// PUT /api/farmers/:id — Update farmer profile
router.put('/:id', auth, async (req, res) => {
  res.json({ success: true, message: 'Profile updated' });
});

// GET /api/farmers/:id/dashboard — Farmer dashboard data
router.get('/:id/dashboard', auth, async (req, res) => {
  res.json({ success: true, data: { weather: {}, iot: {}, revenue: 0, orders: [] } });
});

// GET /api/farmers/:id/certificates — Farmer's certificates
router.get('/:id/certificates', auth, async (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router;
