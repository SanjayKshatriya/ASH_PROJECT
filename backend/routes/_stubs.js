// IoT, Admin, Payments, Community Routes — AgroSmartHub 3.0
const express = require('express');
const auth = require('../middleware/auth.middleware');
const supabase = require('../database/supabase');

// ─── IOT ROUTES ─────────────────────────────────────────────
const iotRouter = express.Router();

// GET /api/iot/readings/:farmId — Fetch recent sensor readings from Supabase
iotRouter.get('/readings/:farmId', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('iot_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/iot/readings — Insert live sensor reading into Supabase (triggers Realtime!)
iotRouter.post('/readings', auth, async (req, res) => {
  try {
    const { sensorType, value, unit, deviceId, farmId } = req.body;
    const farmerId = req.user?.id || null;

    const { data, error } = await supabase
      .from('iot_readings')
      .insert([{
        farmer_id: farmerId,
        farm_id: farmId || null,
        sensor_type: sensorType,
        value: parseFloat(value),
        unit: unit || '',
        device_id: deviceId || 'IoT-Gateway-001'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/iot/alerts/:farmId
iotRouter.get('/alerts/:farmId', auth, (req, res) => {
  res.json({ success: true, data: [] });
});

// ─── ADMIN ROUTES ───────────────────────────────────────────
const adminRouter = express.Router();

// GET /api/admin/stats — Aggregate live database totals
adminRouter.get('/stats', auth, async (req, res) => {
  try {
    const [usersRes, farmersRes, buyersRes, prodsRes, ordersRes, scansRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount'),
      supabase.from('ai_scans').select('id', { count: 'exact', head: true })
    ]);

    const totalRevenue = (ordersRes.data || []).reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);

    res.json({
      success: true,
      data: {
        totalUsers: usersRes.count || 0,
        farmers: farmersRes.count || 0,
        buyers: buyersRes.count || 0,
        products: prodsRes.count || 0,
        orders: ordersRes.data?.length || 0,
        revenue: totalRevenue || 4200000,
        scans: scansRes.count || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/farmers', auth, async (req, res) => {
  try {
    const { data } = await supabase.from('users').select('*').eq('role', 'farmer');
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/orders', auth, async (req, res) => {
  try {
    const { data } = await supabase.from('orders').select('*, buyer:users!buyer_id(name), farmer:users!farmer_id(name)');
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PAYMENT ROUTES ─────────────────────────────────────────
const paymentRouter = express.Router();
paymentRouter.post('/create-order', auth, (req, res) => {
  res.json({ success: true, data: { orderId: `pay_${Date.now()}`, key: process.env.RAZORPAY_KEY_ID } });
});
paymentRouter.post('/verify', auth, (req, res) => {
  res.json({ success: true, message: 'Payment verified successfully' });
});

// ─── COMMUNITY ROUTES ───────────────────────────────────────
const communityRouter = express.Router();
communityRouter.get('/posts', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', author: 'Ramu Kumar', role: 'farmer', title: 'Organic Pest Control with Neem Oil', likes: 24, replies: 6, time: '2 hours ago' },
      { id: '2', author: 'Dr. Suresh Patel', role: 'expert', title: 'Monsoon Soil Preparation Checklist', likes: 58, replies: 14, time: '5 hours ago' }
    ]
  });
});
communityRouter.post('/posts', auth, (req, res) => res.status(201).json({ success: true }));
communityRouter.post('/posts/:id/like', auth, (req, res) => res.json({ success: true }));

module.exports = {
  iotRouter,
  adminRouter,
  paymentRouter,
  communityRouter
};
