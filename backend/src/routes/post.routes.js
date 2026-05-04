const express = require('express');
const asyncHandler = require('../utils/async-handler');
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  validateCreatePost,
  validateCreateComment,
} = require('../validators/post.validator');

const router = express.Router();

router.get('/', authMiddleware, asyncHandler(postController.getPosts));

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  validateCreatePost,
  asyncHandler(postController.createPost)
);

router.post('/:postId/like', authMiddleware, asyncHandler(postController.toggleLike));

router.post(
  '/:postId/comments',
  authMiddleware,
  validateCreateComment,
  asyncHandler(postController.createComment)
);

module.exports = router;