const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }

    const token = authHeader.split(' ')[1];

    const [rows] = await pool.query(
      `
      SELECT us.user_id
      FROM user_sessions us
      WHERE us.session_token = ?
        AND us.revoked_at IS NULL
        AND us.expires_at > NOW()
      LIMIT 1
      `,
      [token]
    );

    if (!rows.length) {
      return res.status(401).json({ message: '유효하지 않은 세션입니다.' });
    }

    req.user = { id: rows[0].user_id };
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;