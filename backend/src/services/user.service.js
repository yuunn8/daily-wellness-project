const pool = require('../config/db');

const normalizeStreakDays = (streakDays, lastCompletedDate) => {
  if (!lastCompletedDate) return 0;

  const last = new Date(lastCompletedDate);
  const today = new Date();

  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > 1) return 0;

  return streakDays || 0;
};

const formatUser = (user) => ({
  id: user.id,
  email: user.email,
  nickname: user.nickname,
  coins: user.coins,
  streakDays: normalizeStreakDays(user.streak_days, user.last_completed_date),
  lastCompletedDate: user.last_completed_date,
  createdAt: user.created_at,
});

const getMe = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT id, email, nickname, coins, streak_days, last_completed_date, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!rows.length) {
    const error = new Error('사용자를 찾을 수 없습니다.');
    error.statusCode = 404;
    throw error;
  }

  return formatUser(rows[0]);
};

const exchangeReward = async ({ userId, price }) => {
  if (!price || price <= 0) {
    const error = new Error('올바르지 않은 상품 가격입니다.');
    error.statusCode = 400;
    throw error;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT id, email, nickname, coins, streak_days, last_completed_date, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [userId]
    );

    if (!rows.length) {
      const error = new Error('사용자를 찾을 수 없습니다.');
      error.statusCode = 404;
      throw error;
    }

    const user = rows[0];

    if (user.coins < price) {
      const error = new Error('코인이 부족합니다.');
      error.statusCode = 400;
      throw error;
    }

    await connection.query(
      `
      UPDATE users
      SET coins = coins - ?,
          updated_at = NOW()
      WHERE id = ?
      `,
      [price, userId]
    );

    const [updatedRows] = await connection.query(
      `
      SELECT id, email, nickname, coins, streak_days, last_completed_date, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    await connection.commit();

    return formatUser(updatedRows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getMe,
  exchangeReward,
};