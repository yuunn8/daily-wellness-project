const missionService = require('../services/mission.service');

const getTodayMissions = async (req, res) => {
  const missions = await missionService.getTodayMissions(req.user.id);

  res.json({
    missions
  });
};

const verifyMission = async (req, res) => {
  const result = await missionService.verifyMission({
    userId: req.user.id,
    missionId: Number(req.body.missionId),
    content: req.body.content,
    filePath: req.file ? `/uploads/${req.file.filename}` : null
  });

  res.status(201).json(result);
};

module.exports = {
  getTodayMissions,
  verifyMission
};