// Auth Routes — AgroSmartHub 3.0
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const supabase = require('../database/supabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agrismarthub_secret_2025';

// ─── POST /api/auth/register ───────────────────────────────────
router.post('/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password, mobile = '', state = '', role = 'farmer' } = req.body;
    const safeRole = ['farmer','buyer','expert','admin','delivery'].includes(role) ? role : 'farmer';

    console.log(`📝 Register attempt: ${email} as ${safeRole}`);

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: safeRole, mobile, state }
      }
    });

    if (authError) {
      console.error('❌ Supabase auth.signUp error:', authError.message);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Registration failed. Please try again.' });
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // Step 2: Insert profile into public.users table
    const { error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email,
        name: name,
        role: safeRole,
        mobile: mobile || null,
        state: state || null
      }]);

    if (dbError) {
      console.error('❌ Database insert error:', dbError.message, '| Code:', dbError.code);
    } else {
      console.log(`✅ User saved to database: ${email}`);
    }

    // Step 3: Build response
    const user = {
      id: authData.user.id,
      email: authData.user.email,
      name: name,
      role: safeRole
    };

    const token = authData.session?.access_token || null;

    if (!token) {
      console.log('⚠️  No session token — disable "Confirm email" in Supabase Auth settings');
    }

    return res.status(201).json({ success: true, token, user });

  } catch (err) {
    console.error('❌ Register route crash:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    console.log(`🔑 Login attempt: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Login error:', authError.message);
      return res.status(401).json({ error: authError.message });
    }

    // Fetch full profile from users table
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const user = {
      id: authData.user.id,
      email: authData.user.email,
      name: profile?.name || authData.user.user_metadata?.name || 'User',
      role: profile?.role || authData.user.user_metadata?.role || 'farmer',
      state: profile?.state || '',
      mobile: profile?.mobile || ''
    };

    console.log(`✅ Login success: ${email} (${user.role})`);

    return res.json({
      success: true,
      token: authData.session.access_token,
      user
    });

  } catch (err) {
    console.error('❌ Login route crash:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/send-otp ───────────────────────────────────
router.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  res.json({ success: true, message: `OTP sent to ${mobile}`, otp: process.env.NODE_ENV !== 'production' ? otp : undefined });
});

// ─── POST /api/auth/verify-otp ────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { mobile } = req.body;
  const token = jwt.sign({ mobile, role: 'farmer' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token });
});

// ─── POST /api/auth/forgot-password ───────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (email) {
    await supabase.auth.resetPasswordForEmail(email);
  }
  res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', require('../middleware/auth.middleware'), (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
