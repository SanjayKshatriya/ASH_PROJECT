const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10*1024*1024 } });

// POST /api/ai/detect — AI Crop Disease Detection
router.post('/detect', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image required' });
    // Forward to Python AI model (YOLOv8) — TODO: uncomment when model is ready
    // const formData = new FormData();
    // formData.append('image', req.file.buffer, req.file.originalname);
    // const aiResponse = await axios.post(process.env.AI_MODEL_URL, formData);
    
    // Demo response (inline — safe for Node.js backend)
    const demo = {
      disease: 'Healthy Crop', emoji: '✅', confidence: 97.4,
      health_score: 96, severity: 'healthy', affected_area: '0%',
      medicine: 'None required', fertilizer: 'Continue NPK schedule',
      water: 'Maintain current schedule', yield_loss: '0%',
      recovery: 'N/A — Crop is healthy', risk: 'Low risk'
    };
    res.json({ success: true, data: demo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/ai/scans/:farmerId — Get scan history
router.get('/scans/:farmerId', auth, async (req, res) => {
  res.json({ success: true, data: [] });
});

// POST /api/ai/advisor — Get AI crop recommendations
router.post('/advisor', auth, async (req, res) => {
  const { question, soilType, state, crop } = req.body;
  res.json({ success: true, recommendation: 'Based on your soil type and weather, apply NPK 19:19:19 @ 5kg/acre', confidence: 94 });
});

// POST /api/ai/market-forecast — Market price prediction
router.post('/market-forecast', auth, async (req, res) => {
  const { crop, weeks } = req.body;
  res.json({ success: true, data: { crop, predictions: [] } });
});

module.exports = router;
