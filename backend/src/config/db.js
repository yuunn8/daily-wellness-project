const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.dbHost,
  port: Number(env.dbPort),
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('DB CONFIG:', {
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  database: env.dbName
});

module.exports = pool;