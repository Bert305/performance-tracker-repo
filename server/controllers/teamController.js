const Team = require('../Module/teamSchema');



// Create a new team
// POST Request -> http://localhost:5000/teams

// Body for Postman
// {
//     "teamName": "Development Team"
// }
const createTeam = async (req, res) => {
    try {
        const newTeam = new Team(req.body);
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//NOTE -> To assign a user a team, you can use the put request and update the User adding the teamID field in the user schema

// Example to add a team to a user

// PUT Request -> http://localhost:5000/team-members/:id

// Body for Postman

// {
//     "username": "john_doe",
//     "password": "password123",
//     "firstName": "John",
//     "lastName": "Doe",
//     "email": "john.doe@example.com",
//     "image": "http://example.com/profile.png",      // Image URL
//     "teamID": "64ebbc0b3d7d933b89a0f7d2"        // Team ID
// }



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
