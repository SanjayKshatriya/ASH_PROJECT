require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  console.log('Connecting to Neon DB...');
  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema...');
    try {
      await pool.query(schemaSql);
      console.log('Schema applied successfully.');
    } catch (schemaErr) {
      if (schemaErr.code === '42P07') { // relation already exists
        console.log('Schema already exists, skipping table creation.');
      } else {
        console.error('Error applying schema:', schemaErr.message);
      }
    }

    console.log('Creating demo users...');
    
    // Check if demo users exist
    const { rows } = await pool.query("SELECT id FROM users WHERE email = 'ramu@farmer.com'");
    
    if (rows.length === 0) {
      const hashedPw = await bcrypt.hash('farmer123', 12);
      await pool.query(`
        INSERT INTO users (farmer_id, name, email, password_hash, role, is_verified, is_active)
        VALUES ('F-20241001', 'Ramu Kumar', 'ramu@farmer.com', $1, 'farmer', true, true)
      `, [hashedPw]);

      const adminHashedPw = await bcrypt.hash('admin123', 12);
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, is_verified, is_active)
        VALUES ('Admin', 'admin@agrismarthub.com', $1, 'admin', true, true)
      `, [adminHashedPw]);

      const buyerHashedPw = await bcrypt.hash('buyer123', 12);
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, is_verified, is_active)
        VALUES ('Priya Buyer', 'priya@buyer.com', $1, 'buyer', true, true)
      `, [buyerHashedPw]);

      const expertHashedPw = await bcrypt.hash('expert123', 12);
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, is_verified, is_active)
        VALUES ('Expert Agri', 'expert@agri.com', $1, 'expert', true, true)
      `, [expertHashedPw]);
      
      console.log('Demo users inserted.');
    } else {
      console.log('Demo users already exist.');
    }

    console.log('Database initialization complete!');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

module.exports = initializeDatabase;
