// tests/setup.js
// Loads .env.test and rebuilds the test schema before the suite runs.

const path = require('path');
const fs = require('fs');

// Load .env.test instead of .env
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.test') });

const pool = require('../src/db/pool');

// Rebuild schema so every run starts from a known state
async function resetSchema() {
  const schemaPath = path.resolve(__dirname, '..', 'src', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Drop everything, then recreate from the migration file
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await pool.query(schema);
}

module.exports = { pool, resetSchema };
