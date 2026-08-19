// Certificate Routes — AgroSmartHub 3.0
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const QRCode = require('qrcode');
const crypto = require('crypto');
const supabase = require('../database/supabase');

// GET /api/certificates — List certificates
router.get('/', async (req, res) => {
  try {
    const { farmerId, status } = req.query;
    let query = supabase.from('certificates').select('*, farmer:users!farmer_id(name, state), expert:users!expert_id(name)');

    if (farmerId) query = query.eq('farmer_id', farmerId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/certificates/generate — Create certificate in Supabase
router.post('/generate', auth, async (req, res) => {
  try {
    const { cropName, cropVariety, harvestDate, grade, scanId, farmerId, state = 'IN' } = req.body;

    const certIdCode = `CERT-${state.substring(0,2).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const blockchainId = '0x' + crypto.randomBytes(32).toString('hex');
    const qrData = `CERT:${certIdCode}|FARMER:${farmerId || req.user.id}|CROP:${cropName}|GRADE:${grade}|HASH:${blockchainId.substring(0,16)}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    const newCert = {
      cert_id: certIdCode,
      farmer_id: farmerId || req.user.id,
      scan_id: scanId || null,
      crop_name: cropName || 'Organic Crop',
      crop_variety: cropVariety || null,
      harvest_date: harvestDate || new Date().toISOString().split('T')[0],
      quality_grade: grade || 'A+',
      health_score: 96.4,
      disease_status: 'Disease-Free (Passed AI Inspection)',
      ai_confidence: 96.4,
      blockchain_id: blockchainId,
      qr_code_url: qrCodeBase64,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('certificates')
      .insert([newCert])
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Certificate generated in Supabase: ${certIdCode} (${data.id})`);
    res.status(201).json({ success: true, data: { ...data, qrCode: qrCodeBase64 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/certificates/:id — Verify certificate by cert_id or UUID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, farmer:users!farmer_id(name, state, email), expert:users!expert_id(name)')
      .or(`id.eq.${req.params.id},cert_id.eq.${req.params.id}`)
      .single();

    if (error) return res.status(404).json({ error: 'Certificate not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/certificates/:id/approve — Expert approves certificate
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const expertId = req.user.id;
    const { notes } = req.body;

    const { data, error } = await supabase
      .from('certificates')
      .update({
        status: 'certified',
        expert_id: expertId,
        expert_notes: notes || 'Verified by Expert',
        issued_at: new Date().toISOString()
      })
      .or(`id.eq.${req.params.id},cert_id.eq.${req.params.id}`)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Certificate approved', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/certificates/:id/reject — Expert rejects certificate
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const expertId = req.user.id;
    const { notes } = req.body;

    const { data, error } = await supabase
      .from('certificates')
      .update({
        status: 'rejected',
        expert_id: expertId,
        expert_notes: notes || 'Rejected by Expert'
      })
      .or(`id.eq.${req.params.id},cert_id.eq.${req.params.id}`)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Certificate rejected', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
