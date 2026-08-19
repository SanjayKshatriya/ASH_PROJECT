// Order Routes — AgroSmartHub 3.0
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const supabase = require('../database/supabase');

// GET /api/orders — List user's orders (Buyer or Farmer)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = supabase.from('orders').select('*, product:products(name, category, price, unit), buyer:users!buyer_id(name, email, mobile), farmer:users!farmer_id(name, email, mobile)');

    if (role === 'buyer') {
      query = query.eq('buyer_id', userId);
    } else if (role === 'farmer') {
      query = query.eq('farmer_id', userId);
    } else {
      // Admin / Delivery — see all
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — Create new order in Supabase
router.post('/', auth, async (req, res) => {
  try {
    const { productId, farmerId, quantity, unitPrice, deliveryAddress, paymentMethod } = req.body;
    const buyerId = req.user.id;

    if (!productId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'productId, quantity, and unitPrice are required' });
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);
    const total = qty * price;
    const gst = total * 0.05;
    const delivery = 150.00;

    const orderIdCode = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const newOrder = {
      order_id: orderIdCode,
      buyer_id: buyerId,
      farmer_id: farmerId || null,
      product_id: productId,
      quantity: qty,
      unit_price: price,
      total_amount: total + gst + delivery,
      gst_amount: gst,
      delivery_charge: delivery,
      delivery_address: deliveryAddress || 'Buyer Address',
      payment_method: paymentMethod || 'UPI',
      payment_status: 'paid',
      order_status: 'placed'
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Order placed in Supabase: ${orderIdCode} (${data.id})`);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, product:products(*), buyer:users!buyer_id(*), farmer:users!farmer_id(*)')
      .or(`id.eq.${req.params.id},order_id.eq.${req.params.id}`)
      .single();

    if (error) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status — Update status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .or(`id.eq.${req.params.id},order_id.eq.${req.params.id}`)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: `Order status updated to ${status}`, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id/tracking — Order tracking nodes
router.get('/:id/tracking', auth, async (req, res) => {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${req.params.id},order_id.eq.${req.params.id}`)
      .single();

    const nodes = [
      { step: 'Order Placed', time: order?.created_at || new Date().toISOString(), done: true },
      { step: 'Quality Inspected', time: new Date().toISOString(), done: order?.order_status !== 'placed' },
      { step: 'In Transit', time: 'Estimated 24h', done: ['shipped','delivered'].includes(order?.order_status) },
      { step: 'Delivered', time: order?.estimated_delivery || 'Upcoming', done: order?.order_status === 'delivered' }
    ];

    res.json({ success: true, data: { orderId: order?.order_id || req.params.id, nodes } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
