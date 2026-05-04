const express = require('express');
const asyncHandler = require('../utils/async-handler');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/me', authMiddleware, asyncHandler(userController.getMe));
router.post('/exchange', authMiddleware, asyncHandler(userController.exchangeReward));

module.exports = router;