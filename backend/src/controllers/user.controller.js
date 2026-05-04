const userService = require('../services/user.service');

const getMe = async (req, res) => {
  const user = await userService.getMe(req.user.id);
  res.json({ user });
};

const exchangeReward = async (req, res) => {
  const { price } = req.body;

  const user = await userService.exchangeReward({
    userId: req.user.id,
    price: Number(price),
  });

  res.json({
    message: '상품 교환이 완료되었습니다.',
    user,
  });
};

module.exports = {
  getMe,
  exchangeReward,
};