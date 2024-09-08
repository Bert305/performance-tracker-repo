const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Routes for managing teams
router.post('/', teamController.createTeam);
router.get('/:id', teamController.getTeamById);
router.put('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);

module.exports = router;
