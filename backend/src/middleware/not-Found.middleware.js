const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    message: '요청한 API를 찾을 수 없습니다.'
  });
};

module.exports = notFoundMiddleware;