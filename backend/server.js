// ============================================================
// AgroSmartHub 3.0 — Express Backend Server
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── SECURITY MIDDLEWARE ───
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors()); // Allow preflight requests

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many auth attempts' } });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ─── CORE MIDDLEWARE ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(morgan('combined'));

// Serve static frontend
app.use(express.static(path.join(__dirname, '..')));

// ─── API ROUTES ───
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/farmers', require('./routes/farmer.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// Stub routes
const { iotRouter, adminRouter, paymentRouter, communityRouter } = require('./routes/_stubs');
app.use('/api/iot', iotRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/community', communityRouter);

// ─── HEALTH CHECK ───
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AgroSmartHub API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ─── 404 HANDLER ───
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// ─── START SERVER ───
app.listen(PORT, () => {
  console.log(`\n🌾 AgroSmartHub Backend v3.0.0`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
