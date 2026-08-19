// ============================================================
// AgroSmartHub 3.0 — Seed Demo Users & Sample Data into Supabase
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

  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      name: user.name,
      role: user.role,
      mobile: user.mobile,
      state: user.state
    }
  });

  let userId = null;

  if (createError) {
    if (createError.message.includes('already registered') || createError.message.includes('already been registered')) {
      console.log(`   ⚠️  User already exists in Auth — updating password...`);
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users.find(u => u.email === user.email);

      if (existing) {
        userId = existing.id;
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
        await upsertProfile(existing.id, user);
      }
    } else {
      console.error(`   ❌ Auth error: ${createError.message}`);
    }
  } else {
    userId = authData.user.id;
    console.log(`   ✅ Auth user created: ${userId}`);
    await upsertProfile(userId, user);
  }

  return userId;
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
    console.error(`   ❌ DB error: ${dbError.message}`);
  } else {
    console.log(`   ✅ Profile saved to DB: ${user.email} (${user.role})`);
  }
}

async function seedSampleData(userMap) {
  console.log('\n🌾 Seeding sample Farms, Products, Certificates, Scans, & Orders...');

  const farmerId = userMap['ramu@farmer.com'];
  const buyerId = userMap['priya@buyer.com'];
  const expertId = userMap['expert@agri.com'];

  if (!farmerId) return;

  // 1. Farm
  let farmId = null;
  const { data: farmData, error: farmErr } = await supabase
    .from('farms')
    .insert([{
      farmer_id: farmerId,
      farm_name: "Ramu's Green Agro Farm",
      total_land: 12.5,
      land_unit: 'acres',
      soil_type: 'Clay Loam',
      irrigation_type: 'Drip Irrigation',
      water_source: 'Borewell & Canal',
      primary_crop: 'Paddy / Organic Rice',
      farming_type: 'Organic',
      latitude: 11.0168,
      longitude: 76.9558,
      gps_location: 'Coimbatore, Tamil Nadu',
      is_organic: true
    }])
    .select('id')
    .single();

  if (!farmErr && farmData) {
    farmId = farmData.id;
    console.log(`  ✅ Farm created: Ramu's Green Agro Farm (${farmId})`);
  } else if (farmErr) {
    console.log(`  ℹ️ Farm setup: ${farmErr.message}`);
  }

  // 2. Products
  const sampleProducts = [
    {
      farmer_id: farmerId,
      farm_id: farmId,
      name: 'Organic Ponni Rice',
      category: 'Grains & Cereals',
      variety: 'TNJ-42',
      description: '100% Pesticide-free naturally grown Ponni rice rich in minerals.',
      price: 68.00,
      unit: 'kg',
      quantity: 500,
      min_order: 10,
      quality_grade: 'A+',
      is_certified: true,
      is_organic: true,
      is_available: true
    },
    {
      farmer_id: farmerId,
      farm_id: farmId,
      name: 'Fresh Red Tomatoes',
      category: 'Vegetables',
      variety: 'Hybrid Shivam',
      description: 'Vine-ripened red tomatoes high in Lycopene.',
      price: 24.50,
      unit: 'kg',
      quantity: 1200,
      min_order: 25,
      quality_grade: 'A',
      is_certified: true,
      is_organic: false,
      is_available: true
    },
    {
      farmer_id: farmerId,
      farm_id: farmId,
      name: 'Organic Turmeric Finger',
      category: 'Spices',
      variety: 'Erode Local',
      description: 'High Curcumin content (>5.2%) organic whole turmeric.',
      price: 180.00,
      unit: 'kg',
      quantity: 250,
      min_order: 5,
      quality_grade: 'A+',
      is_certified: true,
      is_organic: true,
      is_available: true
    }
  ];

  const { data: insertedProds, error: prodErr } = await supabase
    .from('products')
    .insert(sampleProducts)
    .select();

  if (!prodErr && insertedProds) {
    console.log(`  ✅ Seeded ${insertedProds.length} products into Supabase!`);
  } else if (prodErr) {
    console.log(`  ℹ️ Products notice: ${prodErr.message}`);
  }

  // 3. AI Scan
  let scanId = null;
  const { data: scanData, error: scanErr } = await supabase
    .from('ai_scans')
    .insert([{
      farmer_id: farmerId,
      farm_id: farmId,
      image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb1642f?w=600',
      disease_name: 'Early Blight (Alternaria solani)',
      confidence: 96.4,
      health_score: 84.5,
      severity: 'moderate',
      affected_area: '12%',
      medicine: 'Mancozeb 75% WP @ 2g/L water',
      fertilizer: 'NPK 19:19:19 foliar spray',
      water_req: 'Maintain moderate soil moisture; avoid over-watering',
      yield_loss: '5-10%',
      recovery_time: '7-10 days'
    }])
    .select('id')
    .single();

  if (!scanErr && scanData) {
    scanId = scanData.id;
    console.log(`  ✅ Seeded AI scan record (${scanId})`);
  }

  // 4. Certificates
  const certIdCode = `CERT-TN-${new Date().getFullYear()}-8842`;
  const { error: certErr } = await supabase
    .from('certificates')
    .insert([{
      cert_id: certIdCode,
      farmer_id: farmerId,
      product_id: insertedProds?.[0]?.id || null,
      scan_id: scanId,
      crop_name: 'Organic Ponni Rice',
      crop_variety: 'TNJ-42',
      harvest_date: new Date().toISOString().split('T')[0],
      quality_grade: 'A+',
      health_score: 96.4,
      disease_status: 'Disease-Free (Passed AI Inspection)',
      ai_confidence: 96.4,
      expert_id: expertId || null,
      expert_notes: 'Verified organic standards compliance and crop health.',
      blockchain_id: '0x8f2d91a7c3e5b4a6d1e8c9f0a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
      status: 'certified'
    }]);

  if (!certErr) {
    console.log(`  ✅ Seeded Quality Certificate: ${certIdCode}`);
  }

  // 5. Orders
  if (buyerId && insertedProds?.[0]?.id) {
    const orderIdCode = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const { error: ordErr } = await supabase
      .from('orders')
      .insert([{
        order_id: orderIdCode,
        buyer_id: buyerId,
        farmer_id: farmerId,
        product_id: insertedProds[0].id,
        quantity: 50,
        unit_price: 68.00,
        total_amount: 3400.00,
        gst_amount: 170.00,
        delivery_charge: 150.00,
        delivery_address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034',
        payment_method: 'UPI',
        payment_status: 'paid',
        order_status: 'confirmed'
      }]);

    if (!ordErr) {
      console.log(`  ✅ Seeded Sample Order: ${orderIdCode}`);
    }
  }
}

async function main() {
  console.log('\n🌾 AgroSmartHub 3.0 — Supabase Seeder (Users & Sample Data)');
  console.log('════════════════════════════════════════════════════════════\n');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  console.log(`📡 Supabase URL: ${process.env.SUPABASE_URL}`);

  const userMap = {};

  for (const user of DEMO_USERS) {
    const uid = await seedUser(user);
    if (uid) userMap[user.email] = uid;
  }

  await seedSampleData(userMap);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('✅ Seeding complete!\n');
  console.log('Demo Credentials:');
  DEMO_USERS.forEach(u => {
    console.log(`  ${u.role.padEnd(8)} → ${u.email} / ${u.password}`);
  });
  console.log('\nAll demo accounts & sample data are fully synced with Supabase.\n');
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err.message);
  process.exit(1);
});
