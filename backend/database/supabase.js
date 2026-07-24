// ============================================================
// AgroSmartHub 3.0 — Supabase Backend Client
// ============================================================
// Uses SERVICE ROLE KEY — bypasses Row Level Security.
// NEVER expose this key in frontend code.
// ============================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// ─── Key format validation ─────────────────────────────────
const isValidKey = (key) => typeof key === 'string' && key.startsWith('eyJ');

if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.error('❌ SUPABASE_URL is missing or invalid in .env');
  console.error('   Expected: https://xxxx.supabase.co');
} else if (!isValidKey(supabaseKey)) {
  console.error('❌ Supabase key is invalid!');
  console.error('   Current value starts with:', supabaseKey?.substring(0, 20) || '(empty)');
  console.error('');
  console.error('   ➡️  HOW TO FIX:');
  console.error('   1. Open: https://supabase.com/dashboard/project/_/settings/api');
  console.error('   2. Copy "service_role" key (starts with eyJ...)');
  console.error('   3. Paste it as SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  console.error('');
} else {
  console.log('✅ Supabase client initialized:', supabaseUrl);
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Verify that the Supabase connection is working.
 * Call this on server startup to detect misconfiguration early.
 */
async function testConnection() {
  if (!isValidKey(supabaseKey)) {
    console.error('⛔ Skipping Supabase connection test — invalid key format.');
    return false;
  }

  try {
    // A lightweight query: fetch 1 row from users (or get an empty result)
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist yet — schema not applied
      console.warn('⚠️  Supabase connected but "users" table not found.');
      console.warn('   ➡️  Run supabase-schema.sql in your Supabase SQL Editor first.');
      return true; // Connection itself is OK
    }

    if (error) {
      // Auth/network error
      console.error('❌ Supabase DB test failed:', error.message);
      if (error.message.includes('JWT')) {
        console.error('   ➡️  Your service_role key appears to be invalid or expired.');
      }
      return false;
    }

    console.log('✅ Supabase database connection verified.');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
    return false;
  }
}

module.exports = supabase;
module.exports.testConnection = testConnection;
