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

// ─── POST /api/auth/google-sync ────────────────────────────────
router.post('/google-sync', async (req, res) => {
  try {
    const { id, email, name, role = 'farmer', mobile = '', state = '' } = req.body;
    if (!id || !email) {
      return res.status(400).json({ error: 'Missing user ID or Email' });
    }

    console.log(`🌐 Google Auth DB Sync: ${email} (${id})`);

    const { error: dbError } = await supabase
      .from('users')
      .upsert([{
        id,
        email,
        name: name || email.split('@')[0],
        role: ['farmer','buyer','expert','admin','delivery'].includes(role) ? role : 'farmer',
        mobile: mobile || null,
        state: state || null,
        is_active: true
      }], { onConflict: 'id' });

    if (dbError) {
      console.error('❌ Google DB sync error:', dbError.message);
      return res.status(500).json({ error: dbError.message });
    }

    console.log(`✅ Google user profile synchronized to Supabase DB: ${email}`);
    return res.json({ success: true, message: 'Google profile synced to database' });
  } catch (err) {
    console.error('❌ Google sync endpoint crash:', err.message);
    return res.status(500).json({ error: err.message });
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
  const { email, redirectTo } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const redirectUrl = redirectTo || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/index.html#reset-password`;

  console.log(`🔑 Reset password requested for: ${email} -> Redirect: ${redirectUrl}`);

  // 1. Try standard Supabase reset email first
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (!resetErr) {
    return res.json({ success: true, message: 'Password reset link sent to your email! Check your inbox.' });
  }

  console.warn('⚠️ Standard resetPasswordForEmail rate limited or failed:', resetErr.message);

  // 2. Fallback: Use Admin API (Service Role Key) to bypass email rate limit
  try {
    const { data: adminData, error: adminErr } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: redirectUrl }
    });

    if (adminErr) {
      console.error('❌ Admin generateLink error:', adminErr.message);
      return res.status(400).json({ error: resetErr.message || adminErr.message });
    }

    const actionLink = adminData.properties?.action_link;
    console.log('✅ Admin recovery link generated (rate limit bypassed successfully):', actionLink);

    // Send via custom SMTP if configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_USER.includes('your.email')) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'AgroSmartHub <noreply@agrismarthub.com>',
          to: email,
          subject: 'Reset Your Password — AgroSmartHub 3.0',
          html: `<p>Hello,</p><p>Click the link below to reset your password for AgroSmartHub:</p><p><a href="${actionLink}"><strong>Reset Password Now</strong></a></p>`
        });
        return res.json({ success: true, message: 'Password reset email sent successfully via SMTP!' });
      } catch (mailErr) {
        console.error('❌ SMTP send error:', mailErr.message);
      }
    }

    // Return direct action link to frontend to bypass email delivery delay/limits
    return res.json({
      success: true,
      message: 'Password reset link generated! Redirecting...',
      resetLink: actionLink
    });

  } catch (err) {
    console.error('❌ Admin fallback crash:', err.message);
    return res.status(400).json({ error: resetErr ? resetErr.message : err.message });
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { newPassword, token } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    let result;
    if (token) {
      result = await supabase.auth.updateUser({ password: newPassword }, { access_token: token });
    } else {
      result = await supabase.auth.updateUser({ password: newPassword });
    }

    if (result.error) {
      console.error('❌ Reset password update error:', result.error.message);
      return res.status(400).json({ error: result.error.message });
    }

    return res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err) {
    console.error('❌ Reset password endpoint crash:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', require('../middleware/auth.middleware'), (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;

