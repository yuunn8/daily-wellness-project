const postService = require('../services/post.service');

const getPosts = async (req, res) => {
  const posts = await postService.getPosts(req.user.id);

  res.json({ posts });
};

const createPost = async (req, res) => {
  const post = await postService.createPost({
    userId: req.user.id,
    content: req.body.content,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
  });

  res.status(201).json({
    message: '게시글이 작성되었습니다.',
    post,
  });
};

const toggleLike = async (req, res) => {
  const result = await postService.toggleLike({
    postId: Number(req.params.postId),
    userId: req.user.id,
  });

  res.json(result);
};

const createComment = async (req, res) => {
  const comment = await postService.createComment({
    postId: Number(req.params.postId),
    userId: req.user.id,
    content: req.body.content,
  });

  res.status(201).json({
    message: '댓글이 등록되었습니다.',
    comment,
  });
};

module.exports = {
  getPosts,
  createPost,
  toggleLike,
  createComment,
};