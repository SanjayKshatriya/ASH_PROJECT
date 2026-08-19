// Farmer Routes — AgroSmartHub 3.0
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const supabase = require('../database/supabase');

// GET /api/farmers — List all farmers (Admin / Directory)
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, mobile, state, role, created_at')
      .eq('role', 'farmer')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [], total: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/farmers/:id — Get farmer profile and farm info
router.get('/:id', auth, async (req, res) => {
  try {
    const farmerId = req.params.id;

    // Get user profile
    const { data: user, error: uErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', farmerId)
      .single();

    if (uErr && uErr.code !== 'PGRST116') throw uErr;

    // Get farm profile
    const { data: farm, error: fErr } = await supabase
      .from('farms')
      .select('*')
      .eq('farmer_id', farmerId)
      .maybeSingle();

    if (fErr) console.warn('Farm fetch warning:', fErr.message);

    res.json({
      success: true,
      data: {
        ...(user || { id: farmerId, name: 'Farmer' }),
        farm: farm || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/farmers/:id — Update farmer profile & farm info
router.put('/:id', auth, async (req, res) => {
  try {
    const farmerId = req.params.id;
    const { name, mobile, state, district, address, farmName, totalLand, soilType, crop } = req.body;

    // Update user profile
    if (name || mobile || state || district || address) {
      await supabase
        .from('users')
        .update({
          ...(name && { name }),
          ...(mobile && { mobile }),
          ...(state && { state }),
          ...(district && { district }),
          ...(address && { address }),
          updated_at: new Date().toISOString()
        })
        .eq('id', farmerId);
    }

    // Upsert farm info
    if (farmName || totalLand || soilType || crop) {
      await supabase
        .from('farms')
        .upsert([{
          farmer_id: farmerId,
          ...(farmName && { farm_name: farmName }),
          ...(totalLand && { total_land: parseFloat(totalLand) }),
          ...(soilType && { soil_type: soilType }),
          ...(crop && { primary_crop: crop })
        }], { onConflict: 'farmer_id' });
    }

    res.json({ success: true, message: 'Farmer profile and farm updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/farmers/:id/dashboard — Farmer dashboard aggregated metrics
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    const farmerId = req.params.id;

    const [farmsRes, prodsRes, ordersRes, certsRes, scansRes] = await Promise.all([
      supabase.from('farms').select('*').eq('farmer_id', farmerId),
      supabase.from('products').select('*').eq('farmer_id', farmerId),
      supabase.from('orders').select('*').eq('farmer_id', farmerId),
      supabase.from('certificates').select('*').eq('farmer_id', farmerId),
      supabase.from('ai_scans').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }).limit(5)
    ]);

    const orders = ordersRes.data || [];
    const revenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

    res.json({
      success: true,
      data: {
        farmerId,
        farms: farmsRes.data || [],
        productsCount: prodsRes.data?.length || 0,
        ordersCount: orders.length,
        totalRevenue: revenue,
        certificatesCount: certsRes.data?.length || 0,
        recentScans: scansRes.data || [],
        orders
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/farmers/:id/certificates — Farmer's certificates
router.get('/:id/certificates', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('farmer_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
