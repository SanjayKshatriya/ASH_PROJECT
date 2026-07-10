const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const QRCode = require('qrcode');
const crypto = require('crypto');

// POST /api/certificates/generate
router.post('/generate', auth, async (req, res) => {
  try {
    const { cropName, cropVariety, harvestDate, grade, scanId, farmerId } = req.body;
    const certId = `CERT-${req.body.state?.substring(0,2).toUpperCase()||'IN'}-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`;
    const blockchainId = crypto.randomBytes(32).toString('hex');
    const qrData = `CERT:${certId}|FARMER:${farmerId}|CROP:${cropName}|GRADE:${grade}|HASH:${blockchainId.substring(0,16)}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);
    res.status(201).json({ success: true, data: { certId, blockchainId, qrCode: qrCodeBase64, status: 'pending' } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/certificates/:id — Verify certificate
router.get('/:id', async (req, res) => {
  res.json({ success: true, data: { certId: req.params.id, status: 'certified' } });
});

// GET /api/certificates/:id/pdf — Download PDF
router.get('/:id/pdf', auth, async (req, res) => {
  res.json({ success: true, message: 'PDF generation endpoint' });
});

// PATCH /api/certificates/:id/approve — Expert approves
router.patch('/:id/approve', auth, async (req, res) => {
  res.json({ success: true, message: 'Certificate approved', data: { status: 'certified' } });
});

// PATCH /api/certificates/:id/reject — Expert rejects
router.patch('/:id/reject', auth, async (req, res) => {
  res.json({ success: true, message: 'Certificate rejected', data: { status: 'rejected' } });
});

module.exports = router;
