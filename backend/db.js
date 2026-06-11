// db.js
//connects to postgres database using environment variables for security
const { Pool } = require('pg');
require('dotenv').config(); // Loads .env variables

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// A quick test to make sure it connects
pool.connect((err) => {
  if (err) console.error('Database connection error', err.stack);
  else console.log('Connected to the database successfully!');
});

module.exports = pool;