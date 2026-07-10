// ============================================================
// AgroSmartHub 3.0 — Seed Demo Users into Supabase Auth
// Run once: node backend/database/seed-supabase.js
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // MUST use service role key
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEMO_USERS = [
  {
    email: 'ramu@farmer.com',
    password: 'farmer123',
    name: 'Ramu Kumar',
    role: 'farmer',
    mobile: '+91 9876543210',
    state: 'Tamil Nadu'
  },
  {
    email: 'admin@agrismarthub.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    mobile: '+91 9000000001',
    state: 'Delhi'
  },
  {
    email: 'priya@buyer.com',
    password: 'buyer123',
    name: 'Priya Krishnaswamy',
    role: 'buyer',
    mobile: '+91 9988776655',
    state: 'Karnataka'
  },
  {
    email: 'expert@agri.com',
    password: 'expert123',
    name: 'Dr. Suresh Patel',
    role: 'expert',
    mobile: '+91 9111111111',
    state: 'Gujarat'
  }
];

async function seedUser(user) {
  console.log(`\n📧 Processing: ${user.email}`);

  // Try to create the user in Supabase Auth using admin API
  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,      // Auto-confirm — skip email verification
    user_metadata: {
      name: user.name,
      role: user.role,
      mobile: user.mobile,
      state: user.state
    }
  });

  if (createError) {
    if (createError.message.includes('already registered') || createError.message.includes('already been registered')) {
      console.log(`   ⚠️  User already exists in Auth — updating password...`);

      // List users and find this one
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users.find(u => u.email === user.email);

      if (existing) {
        // Update password
        await supabase.auth.admin.updateUserById(existing.id, {
          password: user.password,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role,
            mobile: user.mobile,
            state: user.state
          }
        });
        console.log(`   ✅ Password updated for: ${user.email}`);

        // Upsert into public.users table
        await upsertProfile(existing.id, user);
      }
      return;
    }
    console.error(`   ❌ Auth error: ${createError.message}`);
    return;
  }

  console.log(`   ✅ Auth user created: ${authData.user.id}`);

  // Insert into public.users table
  await upsertProfile(authData.user.id, user);
}

async function upsertProfile(userId, user) {
  const { error: dbError } = await supabase
    .from('users')
    .upsert([{
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role,
      mobile: user.mobile || null,
      state: user.state || null,
      is_active: true
    }], { onConflict: 'id' });

  if (dbError) {
    console.error(`   ❌ DB error: ${dbError.message} (code: ${dbError.code})`);
    if (dbError.code === '42P01') {
      console.log('   ℹ️  The public.users table does not exist yet.');
      console.log('   ➡️  Run the supabase-schema.sql in your Supabase SQL Editor first.');
    }
  } else {
    console.log(`   ✅ Profile saved to DB: ${user.email} (${user.role})`);
  }
}

async function main() {
  console.log('\n🌾 AgroSmartHub 3.0 — Supabase Demo User Seeder');
  console.log('═══════════════════════════════════════════════\n');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  console.log(`📡 Supabase URL: ${process.env.SUPABASE_URL}`);

  // Verify admin API access
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      console.error('\n❌ Cannot access Supabase Admin API:', error.message);
      console.log('\n🔑 Make sure SUPABASE_SERVICE_ROLE_KEY is correct (not the anon key).');
      console.log('   Find it in: Supabase Dashboard → Settings → API → service_role key\n');
      process.exit(1);
    }
    console.log(`✅ Admin API access confirmed (${data.users.length} existing user(s) found)\n`);
  } catch (e) {
    console.error('❌ Failed to connect:', e.message);
    process.exit(1);
  }

  for (const user of DEMO_USERS) {
    await seedUser(user);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('✅ Seeding complete!\n');
  console.log('Demo Credentials:');
  DEMO_USERS.forEach(u => {
    console.log(`  ${u.role.padEnd(8)} → ${u.email} / ${u.password}`);
  });
  console.log('\nAll users have email_confirm=true — no email verification needed.');
  console.log('You can now log in immediately with the demo credentials above.\n');
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err.message);
  process.exit(1);
});
