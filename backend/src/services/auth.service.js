const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const env = require('../config/env');
const { addHours } = require('../utils/date');

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  nickname: user.nickname,
  coins: user.coins,
  streakDays: user.streak_days,
  lastCompletedDate: user.last_completed_date,
  createdAt: user.created_at
});

const signup = async ({ email, password, nickname }) => {
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existing.length) {
    const error = new Error('이미 가입된 이메일입니다.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `
    INSERT INTO users (email, password_hash, nickname)
    VALUES (?, ?, ?)
    `,
    [email, passwordHash, nickname]
  );

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [result.insertId]
  );

  return {
    id: rows[0].id,
    email: rows[0].email,
    nickname: rows[0].nickname,
    coins: rows[0].coins,
    streakDays: rows[0].streak_days,
    lastCompletedDate: rows[0].last_completed_date,
    createdAt: rows[0].created_at
  };
};

const login = async ({ email, password, userAgent, ipAddress }) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (!rows.length) {
    const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    error.statusCode = 401;
    throw error;
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    error.statusCode = 401;
    throw error;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = addHours(new Date(), env.sessionTtlHours);

  await pool.query(
    `
    INSERT INTO user_sessions (user_id, session_token, expires_at, user_agent, ip_address)
    VALUES (?, ?, ?, ?, ?)
    `,
    [user.id, token, expiresAt, userAgent || null, ipAddress || null]
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      coins: user.coins,
      streakDays: user.streak_days,
      lastCompletedDate: user.last_completed_date,
      createdAt: user.created_at
    }
  };
};

const logout = async (token) => {
  await pool.query(
    `
    UPDATE user_sessions
    SET revoked_at = NOW(), updated_at = NOW()
    WHERE session_token = ? AND revoked_at IS NULL
    `,
    [token]
  );
};

module.exports = {
  signup,
  login,
  logout
};