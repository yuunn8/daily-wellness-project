const express = require('express');
const asyncHandler = require('../utils/async-handler');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateSignup, validateLogin } = require('../validators/auth.validator');

const router = express.Router();

router.post('/signup', validateSignup, asyncHandler(authController.signup));
router.post('/login', validateLogin, asyncHandler(authController.login));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

module.exports = router;