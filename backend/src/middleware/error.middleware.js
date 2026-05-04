const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 오류가 발생했습니다.';

  res.status(statusCode).json({
    message
  });
};

module.exports = errorMiddleware;