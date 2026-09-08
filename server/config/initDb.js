require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const initDb = async () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('Schema applied successfully');
  } catch (err) {
    console.error('Failed to apply schema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

initDb();
