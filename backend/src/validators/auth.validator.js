const validateSignup = (req, res, next) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: '이메일, 비밀번호, 닉네임은 필수입니다.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin
};