const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key on backend so database inserts bypass Row Level Security
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Check your .env file.');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅ set' : '❌ missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ missing');
} else {
  console.log('✅ Supabase client initialized:', supabaseUrl);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabase;
