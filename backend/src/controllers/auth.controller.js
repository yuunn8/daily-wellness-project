const authService = require('../services/auth.service');

const signup = async (req, res) => {
    console.log('[SIGNUP BODY]', req.body);
  const user = await authService.signup(req.body);

  res.status(201).json({
    message: '회원가입이 완료되었습니다.',
    user
  });
};

const login = async (req, res) => {
    console.log('[LOGIN BODY]', req.body);
  const result = await authService.login({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });

  res.json({
    message: '로그인 성공',
    token: result.token,
    user: result.user
  });
};

const logout = async (req, res) => {
  await authService.logout(req.token);

  res.json({
    message: '로그아웃되었습니다.'
  });
};

module.exports = {
  signup,
  login,
  logout
};