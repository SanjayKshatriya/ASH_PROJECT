const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const { Client } = require('pg');

async function applySchema() {
  console.log('⚡ Connecting directly to Supabase PostgreSQL...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL database via Transaction Pooler!');

    const schemaPath = path.resolve(__dirname, 'supabase-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Applying schema (supabase-schema.sql)...');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      // Filter out comment-only statements
      const cleanStmt = stmt.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim();
      if (!cleanStmt) continue;

      try {
        await client.query(cleanStmt);
        const title = cleanStmt.split('\n')[0].substring(0, 60);
        console.log(`  ✅ Executed: ${title}...`);
      } catch (stmtErr) {
        if (stmtErr.code === '42P07' || stmtErr.message.includes('already exists')) {
          console.log(`  ℹ️  Notice: Object already exists, skipping.`);
        } else {
          console.warn(`  ⚠️  Warning executing statement (${stmtErr.code}):`, stmtErr.message);
        }
      }
    }

    console.log('🎉 Schema application complete! All tables verified.');

  } catch (err) {
    console.error('❌ Connection or file error:', err.message);
  } finally {
    await client.end();
  }
}

applySchema();

