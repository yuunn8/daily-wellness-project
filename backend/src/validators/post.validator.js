const validateCreatePost = (req, res, next) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: '게시글 내용을 입력해주세요.' });
  }

  if (content.length > 100) {
    return res.status(400).json({ message: '게시글은 100자 이하여야 합니다.' });
  }

  next();
};


const validateUpdatePost = (req, res, next) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: '수정할 내용을 입력해주세요.' });
  }

  if (content.length > 100) {
    return res.status(400).json({ message: '게시글은 100자 이하여야 합니다.' });
  }

  next();
};

const validateCreateComment = (req, res, next) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
  }

  if (content.length > 50) {
    return res.status(400).json({ message: '댓글은 50자 이하여야 합니다.' });
  }

  next();
};

module.exports = {
  validateCreatePost,
  validateUpdatePost,
  validateCreateComment,
};