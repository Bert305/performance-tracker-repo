const TeamMember = require('../Module/userSchema');
const Team = require('../Module/teamSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');





//GET Request -> http://localhost:5000/team-members/test
const test = (req, res) => {
    res.send('Test route, Hello World!');
}



// Register new team member
//POST Request -> http://localhost:5000/team-members/register

// Body for Postman
// {
//     "username": "john_doe",
//     "password": "password123",
//     "firstName": "John",
//     "lastName": "Doe",
//     "email": "john.doe@example.com",
//     "image": "http://example.com/profile.png"
// }
const createTeamMember = async (req, res) => {
    console.log(req.body);
    try {
        const { username, password, firstName, lastName, email, image, teamID } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newTeamMember = new TeamMember({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            email,
            image,
            teamID
        });
        await newTeamMember.save();
        res.status(201).json(newTeamMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Login team member
// POST Request -> http://localhost:5000/team-members/login

// Body for Postman
// {
//     "username": "john_doe",
//     "password": "password123"
// }
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const teamMember = await TeamMember.findOne({ username });

        if (!teamMember) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Compare the password with the stored hashed password
        const isMatch = await bcrypt.compare(password, teamMember.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
         // Generate a JWT token valid for 72 hour
        const token = jwt.sign({ id: teamMember._id }, 'your_jwt_secret', { expiresIn: '72h' });
        // Send the token and user data as the response
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get team member by ID
// GET Request -> http://localhost:5000/team-members/:id
const getTeamMemberById = async (req, res) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id).populate('teamID');
        if (!teamMember) return res.status(404).json({ message: 'Team member not found' });
        res.json(teamMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update team member
// PUT Request -> http://localhost:5000/team-members/:id
const updateTeamMember = async (req, res) => {
    try {
        const updatedTeamMember = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTeamMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete team member
// DELETE Request -> http://localhost:5000/team-members/:id
const deleteTeamMember = async (req, res) => {
    try {
        await TeamMember.findByIdAndDelete(req.params.id);
        res.json({ message: 'Team member deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add task to team member
// POST Request -> http://localhost:5000/team-members/:id/tasks

// Body for Postman
// { "taskName": "Design API",
// "description": "Design and implement the REST API for the project",
// "assignedDate": "2024-09-01T00:00:00.000Z", year-month-date
// "dueDate": "2024-09-15T00:00:00.000Z",
// "complexity": 5 }
const addTask = async (req, res) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id);
        teamMember.tasks.push(req.body);
        await teamMember.save();
        res.json(teamMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update task
// PUT Request -> http://localhost:5000/team-members/:id/tasks/:taskId
const updateTask = async (req, res) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id);
        const task = teamMember.tasks.id(req.params.taskId);
        Object.assign(task, req.body);
        await teamMember.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete task
// DELETE Request -> http://localhost:5000/team-members/:id/tasks/:taskId
const deleteTask = async (req, res) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id);
        teamMember.tasks.id(req.params.taskId).remove();
        await teamMember.save();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add performance metrics
// PUT Request -> http://localhost:5000/team-members/:id/performance-metrics

// Body for Postman
// { "performanceMetrics": { "qualityScore": 8, "quantityScore": 7, "overallScore": 7.5 } }
const addPerformanceMetrics = async (req, res) => {
    try {
        // Find the team member by their ID
        const teamMember = await TeamMember.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Update performance metrics
        const { performanceMetrics } = req.body;

        if (!performanceMetrics) {
            return res.status(400).json({ message: 'Performance metrics are required' });
        }

        teamMember.performanceMetrics = performanceMetrics;

        // Save the updated team member document
        await teamMember.save();

        res.status(200).json({
            message: 'Performance metrics updated successfully',
            performanceMetrics: teamMember.performanceMetrics
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all team members, their tasks, image, team info, and performance metrics
// GET Request -> http://localhost:5000/team-members/:id/team-info
const getAllTeamInfo = async (req, res) => {
    try {
        // Find the logged-in team member by ID
        const teamMember = await TeamMember.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Find the team they belong to and populate team members
        const team = await Team.findById(teamMember.teamID).populate('members');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Get all team members from the same team, including their tasks and performance metrics
        const teamMembersInfo = await TeamMember.find({ teamID: team._id })
            .select('firstName lastName email image tasks performanceMetrics teamID')
            .populate('teamID', 'teamName')  // Populate team information
            .exec();

        res.json(teamMembersInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logout team member
// POST Request -> http://localhost:5000/team-members/logout
const logout = (req, res) => {
    // Clear the token from the client-side
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
};

module.exports = {
    test,
    login,
    createTeamMember,
    getTeamMemberById,
    updateTeamMember,
    deleteTeamMember,
    logout,
    addTask,
    updateTask,
    deleteTask,
    addPerformanceMetrics,
    getAllTeamInfo
}

// const User = require('../Module/userSchema')

// //get all users
// //@route get /api/user
// const getUsers = async (req, res) => {
//     try {
//         const users = await User.find();
//         res.status(200).json(users)
//     }
//     catch (error) {
//         res.status(500).json({error: error.message});
//     }
// }

// //get one user
// const getOneUser = async (req,res)=>{
//     try {
//         const {id} = req.params;
//         const user = await User.findById(id);
//         res.status(200).json(user)
//     }
//     catch (error) {
//         res.status(500).json({error: error.message});
//     }
// }

// //post new user
// //@route post /api/user
// const postUser = async (req, res) => {
//     try {
//         console.log(req.body)
//         const newUser = new User({ ...req.body});
//         if (await newUser.save()) {
//             res.status(200).json(newUser)
//         }
//     }
//     catch (error) {
//         res.status(500).json({error: error.message});
//     }
// }
// //edit existing user
// //@route put /api/user/:id
// const editUser = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedUser = await User.findByIdAndUpdate(id, req.body, {
//           new: true,
//         });
//         res.status(200).json(updatedUser);
//       } catch (error) {
//         res.status(500).json({ error: error.message });
//       }
// }
// //delete existing user
// //@route delete /api/user/:id
// const deleteUser = async (req, res) => {
//     try {
//         const {id} = req.params;
//         if ( await User.findByIdAndDelete(id)) {
//             res.status(200).send("This user has been deleted");
//         }
//     }
//     catch (error) {
//             res.status(500).json({error: error.message});
//     }
// }

// module.exports = {
//     getUsers,
//     postUser,
//     editUser,
//     deleteUser,
//     getOneUser 
// }