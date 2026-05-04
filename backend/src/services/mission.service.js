const pool = require('../config/db');

const getKstDateString = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;

  return `${year}-${month}-${day}`;
};

const toYMD = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const diffDays = (fromDate, toDate) => {
  const [fy, fm, fd] = fromDate.split('-').map(Number);
  const [ty, tm, td] = toDate.split('-').map(Number);

  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);

  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
};

const calculateNextStreak = (currentStreak, lastCompletedDate, today) => {
  if (!lastCompletedDate) {
    return 1;
  }

  const lastDate = toYMD(lastCompletedDate);
  const diff = diffDays(lastDate, today);

  if (diff === 0) {
    return currentStreak || 1;
  }

  if (diff === 1) {
    return (currentStreak || 0) + 1;
  }

  return 1;
};

const getTodayMissions = async (userId) => {
  const today = getKstDateString();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT id FROM daily_missions WHERE mission_date = ? LIMIT 1`,
      [today]
    );

    if (!existing.length) {
      const [randomMissions] = await connection.query(
        `
        SELECT id
        FROM missions
        WHERE is_active = TRUE
        ORDER BY RAND()
        LIMIT 6
        `
      );

      for (let i = 0; i < randomMissions.length; i++) {
        await connection.query(
          `
          INSERT INTO daily_missions (mission_date, mission_id, sort_order)
          VALUES (?, ?, ?)
          `,
          [today, randomMissions[i].id, i + 1]
        );
      }
    }

    const [rows] = await connection.query(
      `
      SELECT
        dm.id AS daily_mission_id,
        dm.mission_date,
        dm.sort_order,
        m.id AS mission_id,
        m.title,
        m.description,
        m.category,
        m.reward_coins,
        COALESCE(ums.status, 'pending') AS status,
        ums.completed_at,
        ums.mission_log_id
      FROM daily_missions dm
      JOIN missions m ON dm.mission_id = m.id
      LEFT JOIN user_mission_status ums
        ON ums.user_id = ?
        AND ums.mission_id = dm.mission_id
        AND ums.mission_date = dm.mission_date
      WHERE dm.mission_date = ?
        AND m.is_active = TRUE
      ORDER BY dm.sort_order ASC
      `,
      [userId, today]
    );

    await connection.commit();

    return rows.map((row) => ({
      dailyMissionId: row.daily_mission_id,
      missionDate: row.mission_date,
      sortOrder: row.sort_order,
      id: row.mission_id,
      title: row.title,
      description: row.description,
      category: row.category,
      rewardCoins: row.reward_coins,
      completed: row.status === 'completed',
      completedAt: row.completed_at,
      missionLogId: row.mission_log_id,
    }));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const verifyMission = async ({ userId, missionId, content, filePath }) => {
  const today = getKstDateString();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [missionRows] = await connection.query(
      `
      SELECT id, title, reward_coins
      FROM missions
      WHERE id = ? AND is_active = TRUE
      LIMIT 1
      `,
      [missionId]
    );

    if (!missionRows.length) {
      const error = new Error('존재하지 않는 미션입니다.');
      error.statusCode = 404;
      throw error;
    }

    const mission = missionRows[0];

    const [dailyRows] = await connection.query(
      `
      SELECT id
      FROM daily_missions
      WHERE mission_id = ? AND mission_date = ?
      LIMIT 1
      `,
      [missionId, today]
    );

    if (!dailyRows.length) {
      const error = new Error('오늘 배정된 미션이 아닙니다.');
      error.statusCode = 400;
      throw error;
    }

    const [statusRows] = await connection.query(
      `
      SELECT id, status
      FROM user_mission_status
      WHERE user_id = ? AND mission_id = ? AND mission_date = ?
      LIMIT 1
      `,
      [userId, missionId, today]
    );

    if (statusRows.length && statusRows[0].status === 'completed') {
      const error = new Error('이미 완료한 미션입니다.');
      error.statusCode = 409;
      throw error;
    }

    const [userRows] = await connection.query(
      `
      SELECT id, streak_days, last_completed_date
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [userId]
    );

    if (!userRows.length) {
      const error = new Error('사용자를 찾을 수 없습니다.');
      error.statusCode = 404;
      throw error;
    }

    const currentUser = userRows[0];

    const newStreakDays = calculateNextStreak(
      currentUser.streak_days,
      currentUser.last_completed_date,
      today
    );

    const [logResult] = await connection.query(
      `
      INSERT INTO mission_logs
        (user_id, mission_id, mission_date, image_url, content, verified)
      VALUES (?, ?, ?, ?, ?, TRUE)
      `,
      [userId, missionId, today, filePath, content || null]
    );

    const missionLogId = logResult.insertId;

    if (statusRows.length) {
      await connection.query(
        `
        UPDATE user_mission_status
        SET status = 'completed',
            completed_at = NOW(),
            mission_log_id = ?,
            updated_at = NOW()
        WHERE id = ?
        `,
        [missionLogId, statusRows[0].id]
      );
    } else {
      await connection.query(
        `
        INSERT INTO user_mission_status
          (user_id, mission_id, mission_date, status, completed_at, mission_log_id)
        VALUES (?, ?, ?, 'completed', NOW(), ?)
        `,
        [userId, missionId, today, missionLogId]
      );
    }

    await connection.query(
      `
      UPDATE users
      SET coins = coins + ?,
          streak_days = ?,
          last_completed_date = ?,
          updated_at = NOW()
      WHERE id = ?
      `,
      [mission.reward_coins, newStreakDays, today, userId]
    );

    await connection.query(
      `
      INSERT INTO posts (user_id, mission_log_id, content, image_url)
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        missionLogId,
        content || `${mission.title} 완료!`,
        filePath,
      ]
    );

    await connection.commit();

    return {
      message: '미션 인증이 완료되었습니다.',
      rewardCoins: mission.reward_coins,
      streakDays: newStreakDays,
      missionLogId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getTodayMissions,
  verifyMission,
};