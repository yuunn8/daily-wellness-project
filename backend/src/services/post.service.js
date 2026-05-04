const pool = require('../config/db');

const getPosts = async (userId) => {
  const [posts] = await pool.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.mission_log_id,
      p.content,
      p.image_url,
      p.created_at,
      u.nickname,
      m.title AS mission_title,
      (
        SELECT COUNT(*)
        FROM likes l
        WHERE l.post_id = p.id
      ) AS like_count,
      EXISTS (
        SELECT 1
        FROM likes l2
        WHERE l2.post_id = p.id
          AND l2.user_id = ?
      ) AS is_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN mission_logs ml ON p.mission_log_id = ml.id
    LEFT JOIN missions m ON ml.mission_id = m.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    `,
    [userId]
  );

  const postIds = posts.map((post) => post.id);
  let commentsByPostId = {};

  if (postIds.length > 0) {
    const [comments] = await pool.query(
      `
      SELECT
        c.id,
        c.post_id,
        c.content,
        c.created_at,
        u.id AS user_id,
        u.nickname
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.deleted_at IS NULL
        AND c.post_id IN (?)
      ORDER BY c.created_at ASC
      `,
      [postIds]
    );

    commentsByPostId = comments.reduce((acc, comment) => {
      const postId = comment.post_id;

      if (!acc[postId]) {
        acc[postId] = [];
      }

      acc[postId].push({
        id: String(comment.id),
        userId: String(comment.user_id),
        userName: comment.nickname,
        text: comment.content,
        createdAt: comment.created_at,
      });

      return acc;
    }, {});
  }

  return posts.map((post) => ({
    id: String(post.id),
    userId: String(post.user_id),
    userName: post.nickname,
    missionTitle: post.mission_title || '미션 인증',
    imageUrl: post.image_url,
    caption: post.content,
    likes: Number(post.like_count),
    liked: Boolean(post.is_liked),
    createdAt: post.created_at,
    comments: commentsByPostId[post.id] || [],
  }));
};

const createPost = async ({ userId, content, imageUrl = null }) => {
  const [result] = await pool.query(
    `
    INSERT INTO posts (user_id, content, image_url)
    VALUES (?, ?, ?)
    `,
    [userId, content, imageUrl]
  );

  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.content,
      p.image_url,
      p.created_at,
      u.nickname
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
    LIMIT 1
    `,
    [result.insertId]
  );

  const row = rows[0];

  return {
    id: String(row.id),
    userId: String(row.user_id),
    userName: row.nickname,
    missionTitle: '직접 작성',
    imageUrl: row.image_url,
    caption: row.content,
    likes: 0,
    liked: false,
    createdAt: row.created_at,
    comments: [],
  };
};

const toggleLike = async ({ postId, userId }) => {
  const [existing] = await pool.query(
    'SELECT id FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1',
    [postId, userId]
  );

  if (existing.length) {
    await pool.query('DELETE FROM likes WHERE id = ?', [existing[0].id]);
    return { liked: false };
  }

  await pool.query(
    'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
    [postId, userId]
  );

  return { liked: true };
};

const createComment = async ({ postId, userId, content }) => {
  const [result] = await pool.query(
    `
    INSERT INTO comments (post_id, user_id, content)
    VALUES (?, ?, ?)
    `,
    [postId, userId, content]
  );

  const [rows] = await pool.query(
    `
    SELECT
      c.id,
      c.post_id,
      c.content,
      c.created_at,
      u.id AS user_id,
      u.nickname
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
    LIMIT 1
    `,
    [result.insertId]
  );

  const row = rows[0];

  return {
    id: String(row.id),
    userId: String(row.user_id),
    userName: row.nickname,
    text: row.content,
    createdAt: row.created_at,
  };
};

module.exports = {
  getPosts,
  createPost,
  toggleLike,
  createComment,
};