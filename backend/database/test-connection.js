// ============================================================
// AgroSmartHub 3.0 — Supabase Connection Diagnostic
// ============================================================
// Run: node backend/database/test-connection.js
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY     = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isValidKey = (k) => typeof k === 'string' && k.startsWith('eyJ');

console.log('\n🌾 AgroSmartHub — Supabase Connection Diagnostic');
console.log('═'.repeat(52));

// ─── 1. Check env values ─────────────────────────────────
console.log('\n[1] Environment Variables');
console.log(`  SUPABASE_URL         : ${SUPABASE_URL || '❌ MISSING'}`);
console.log(`  SUPABASE_ANON_KEY    : ${isValidKey(ANON_KEY)    ? '✅ Valid (eyJ...)' : `❌ Invalid → "${ANON_KEY?.substring(0,30)}..."`}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${isValidKey(SERVICE_KEY) ? '✅ Valid (eyJ...)' : `❌ Invalid → "${SERVICE_KEY?.substring(0,30)}..."`}`);

if (!SUPABASE_URL || !isValidKey(ANON_KEY) || !isValidKey(SERVICE_KEY)) {
  console.log('\n💡 HOW TO FIX:');
  console.log('  1. Open: https://supabase.com/dashboard/project/_/settings/api');
  console.log('  2. Copy the following values into backend/.env:');
  console.log('     • Project URL         → SUPABASE_URL');
  console.log('     • anon/public key     → SUPABASE_ANON_KEY    (starts with eyJ...)');
  console.log('     • service_role key    → SUPABASE_SERVICE_ROLE_KEY (starts with eyJ...)');
  console.log('  3. Restart the backend server\n');

  if (!SUPABASE_URL || !isValidKey(SERVICE_KEY)) {
    console.log('⛔ Cannot proceed — fix the keys above first.\n');
    process.exit(1);
  }
}

// ─── 2. Test Auth API (anon key) ──────────────────────────
async function testAnonAuth() {
  console.log('\n[2] Testing Supabase Auth API (anon key)...');
  try {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    // signInWithPassword with bad credentials — expect AuthInvalidCredentialsError, NOT network error
    const { error } = await client.auth.signInWithPassword({
      email: 'probe@test.invalid',
      password: 'probepassword'
    });
    if (error && (error.message.includes('Invalid') || error.message.includes('credentials') || error.message.toLowerCase().includes('email not confirmed'))) {
      console.log('  ✅ Auth API reachable — got expected "invalid credentials" response');
    } else if (error) {
      console.log(`  ⚠️  Auth API returned: ${error.message}`);
    } else {
      console.log('  ✅ Auth API OK');
    }
  } catch (err) {
    console.log(`  ❌ Network error: ${err.message}`);
    console.log('  → Check if SUPABASE_URL is correct');
  }
}

// ─── 3. Test DB (service role key) ────────────────────────
async function testServiceRole() {
  console.log('\n[3] Testing Supabase Database (service_role key)...');
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await admin.from('users').select('count').limit(1);

    if (error && error.code === '42P01') {
      console.log('  ⚠️  Connected! But "users" table does not exist yet.');
      console.log('  → Run supabase-schema.sql in your Supabase SQL Editor');
    } else if (error) {
      console.log(`  ❌ DB error: ${error.message} (code: ${error.code})`);
      if (error.message.includes('JWT')) {
        console.log('  → SUPABASE_SERVICE_ROLE_KEY is invalid or from the wrong project');
      }
    } else {
      console.log('  ✅ Database connected and "users" table exists!');
    }
  } catch (err) {
    console.log(`  ❌ Network error: ${err.message}`);
  }
}

// ─── 4. Test Admin API ────────────────────────────────────
async function testAdminApi() {
  console.log('\n[4] Testing Admin API (list users)...');
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 5 });
    if (error) {
      console.log(`  ❌ Admin API error: ${error.message}`);
      console.log('  → Make sure SUPABASE_SERVICE_ROLE_KEY is the "service_role" key, not "anon"');
    } else {
      console.log(`  ✅ Admin API OK — ${data.users.length} user(s) in database`);
      if (data.users.length > 0) {
        console.log('  Users found:');
        data.users.slice(0, 5).forEach(u => {
          console.log(`    • ${u.email} (${u.user_metadata?.role || 'no role'})`);
        });
      } else {
        console.log('  → No users yet. Run: npm run seed:supabase');
      }
    }
  } catch (err) {
    console.log(`  ❌ Network error: ${err.message}`);
  }
}

// ─── 5. Test iot_readings table ───────────────────────────
async function testIotTable() {
  console.log('\n[5] Checking iot_readings table (for realtime IoT)...');
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { error } = await admin.from('iot_readings').select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log('  ⚠️  "iot_readings" table not found.');
      console.log('  → Run the updated supabase-schema.sql in your Supabase SQL Editor');
    } else if (error) {
      console.log(`  ⚠️  Error: ${error.message}`);
    } else {
      console.log('  ✅ "iot_readings" table exists — Realtime IoT ready!');
    }
  } catch (err) {
    console.log(`  ❌ Network error: ${err.message}`);
  }
}

// ─── Run all tests ────────────────────────────────────────
async function main() {
  await testAnonAuth();
  await testServiceRole();
  await testAdminApi();
  await testIotTable();

  console.log('\n' + '═'.repeat(52));
  console.log('Diagnostic complete.\n');
  console.log('Next steps if everything is ✅:');
  console.log('  node backend/database/seed-supabase.js   ← seed demo users');
  console.log('  cd backend && node server.js             ← start server\n');
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err.message);
  process.exit(1);
});
