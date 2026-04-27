// config/db.js
// MySQL database connection setup using mysql2 package

const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool (better than single connection for production)
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // Database host (localhost)
  user: process.env.DB_USER,       // MySQL username
  password: process.env.DB_PASSWORD, // MySQL password
  database: process.env.DB_NAME,   // Database name
  waitForConnections: true,
  connectionLimit: 10,             // Max 10 simultaneous connections
  queueLimit: 0
});

// Get promise-based version of pool (allows async/await usage)
const promisePool = pool.promise();

// Test the connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ MySQL Database connected successfully!');
  connection.release(); // Release connection back to pool
});

module.exports = promisePool;
