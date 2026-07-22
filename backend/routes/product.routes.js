const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

// GET /api/products/market/prices — Live market prices
// ⚠️ MUST be before /:id to avoid Express treating "market" as an ID
router.get('/market/prices', async (req, res) => {
  res.json({ success: true, data: [] });
});

// GET /api/products — List marketplace products
router.get('/', async (req, res) => {
  const { category, grade, certified, search, page=1, limit=20 } = req.query;
  res.json({ success: true, data: [], total: 0, page, limit });
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  res.json({ success: true, data: null });
});

// POST /api/products — Create product listing
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, price, unit, quantity, description } = req.body;
    const productId = `P-${Date.now().toString(36).toUpperCase()}`;
    res.status(201).json({ success: true, data: { id: productId, name, category, price, unit, quantity } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/products/:id
router.put('/:id', auth, async (req, res) => {
  res.json({ success: true, message: 'Product updated' });
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  res.json({ success: true, message: 'Product removed' });
});

module.exports = router;
