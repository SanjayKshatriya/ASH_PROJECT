// ============================================================
// Auth Middleware — AgroSmartHub 3.0
// Verifies Supabase JWT tokens issued by Supabase Auth
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabase = require('../database/supabase');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the Supabase JWT by calling getUser() — this validates the token
    // against Supabase's own JWT secret, not our local JWT_SECRET
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id:    user.id,
      email: user.email,
      role:  user.user_metadata?.role || 'farmer',
      name:  user.user_metadata?.name || 'User'
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};
