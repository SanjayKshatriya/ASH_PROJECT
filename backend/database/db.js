// ============================================================
// AgroSmartHub 3.0 — PostgreSQL Pool (via Supabase Pooler)
// ============================================================
// Uses Supabase Transaction Pooler (port 6543) instead of a
// local PostgreSQL server. Set DATABASE_URL in your .env to:
//   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
// ============================================================

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

let pool = null;

function getPool() {
  if (pool) return pool;

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('[YOUR-PASSWORD]')) {
    console.warn('⚠️  DATABASE_URL is not configured for Supabase. Raw SQL queries disabled.');
    console.warn('   Direct DB calls will be skipped — Supabase JS client is used instead.');
    return null;
  }

  pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }, // required for Supabase pooler
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected PostgreSQL pool error:', err.message);
  });

  return pool;
}

/**
 * Execute a raw SQL query via the pg pool.
 * Returns null if the pool is not configured (graceful degradation).
 */
async function query(text, params) {
  const p = getPool();
  if (!p) return null;
  try {
    return await p.query(text, params);
  } catch (err) {
    console.error('❌ DB query error:', err.message);
    throw err;
  }
}

module.exports = { query, getPool };
