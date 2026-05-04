const express = require('express');
const asyncHandler = require('../utils/async-handler');
const missionController = require('../controllers/mission.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { validateMissionVerify } = require('../validators/mission.validator');

const router = express.Router();

router.get('/today', authMiddleware, asyncHandler(missionController.getTodayMissions));

router.post(
  '/verify',
  authMiddleware,
  upload.single('image'),
  validateMissionVerify,
  asyncHandler(missionController.verifyMission)
);

module.exports = router;