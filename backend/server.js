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

// ─── SECURITY MIDDLEWARE ───────────────────────────────────
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

// ─── CORE MIDDLEWARE ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(morgan('combined'));

// Serve static frontend
app.use(express.static(path.join(__dirname, '..')));

// ─── API ROUTES ────────────────────────────────────────────
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

// ─── HEALTH CHECK ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AgroSmartHub API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ─── SUPABASE CONFIG STATUS (public, no secrets) ──────────
app.get('/api/supabase-config', (req, res) => {
  const url = process.env.SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  const isValidKey = (k) => typeof k === 'string' && k.startsWith('eyJ');
  res.json({
    url: url || null,
    anonKeyValid: isValidKey(anonKey),
    serviceKeyValid: isValidKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
    configured: !!url && isValidKey(anonKey)
  });
});

// ─── 404 HANDLER ──────────────────────────────────────────
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── ERROR HANDLER ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// ─── START SERVER ─────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🌾 AgroSmartHub Backend v3.0.0`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);

  // ── Verify Supabase connection on startup ──
  console.log('🔌 Testing Supabase connection...');
  try {
    const { testConnection } = require('./database/supabase');
    const ok = await testConnection();
    if (!ok) {
      console.warn('\n⚠️  Supabase is NOT connected. Login/registration will fail.');
      console.warn('   → Open backend/.env and set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      console.warn('   → Keys must start with eyJ... (get them from Supabase Dashboard → Settings → API)\n');
    }
  } catch (e) {
    console.error('❌ Supabase startup check failed:', e.message);
  }
});

module.exports = app;
