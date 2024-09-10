const Team = require('../Module/teamSchema');

// Create a new team
const createTeam = async (req, res) => {
    try {
        const newTeam = new Team(req.body);
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get team by ID
const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate('members');
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update team
const updateTeam = async (req, res) => {
    try {
        const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete team
const deleteTeam = async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);
        res.json({ message: 'Team deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTeam,
    getTeamById,
    updateTeam,
    deleteTeam
}
