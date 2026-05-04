require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASS || '',
  dbName: process.env.DB_NAME || 'daily_wellness',
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS || 24 * 7)
};