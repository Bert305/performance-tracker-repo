const express = require('express');
const router = express.Router();
const {createTeam, getTeamById, updateTeam, deleteTeam} = require('../controllers/teamController')
// Routes for managing teams
router.post('/', createTeam);
router.get('/:id', getTeamById);
router.put('/:id', updateTeam);
router.delete('/:id',deleteTeam);

module.exports = router;
