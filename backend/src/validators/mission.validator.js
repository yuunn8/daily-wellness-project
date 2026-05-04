const validateMissionVerify = (req, res, next) => {
  const { missionId, content } = req.body;

  if (!missionId) {
    return res.status(400).json({ message: 'missionId는 필수입니다.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: '인증 이미지는 필수입니다.' });
  }

  if (content && content.length > 500) {
    return res.status(400).json({ message: '인증 글은 500자 이하여야 합니다.' });
  }

  next();
};

module.exports = {
  validateMissionVerify
};