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
        const { username, password, firstName, lastName, email, image} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newTeamMember = new TeamMember({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            email,
            image
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
        const token = jwt.sign({ id: teamMember._id }, 'your_jwt_secret', { expiresIn: '8766h' });
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
        // Find the team member by ID
        const teamMember = await TeamMember.findById(req.params.id)
            .select('-password') // Exclude the password field
            .populate({
                path: 'tasks',
                select: 'taskName description complexity status assignedDate'
            }) // Populate tasks if it's a reference
            .populate({
                path: 'teamID',
                select: 'teamName'
            }); // Populate team information

        // If no team member is found, return a 404 status
        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Log the team member data for debugging
        console.log('Team Member Data:', teamMember);

        // Return the team member data as a JSON response
        res.status(200).json({
            _id: teamMember._id,
            username: teamMember.username,
            firstName: teamMember.firstName,
            lastName: teamMember.lastName,
            email: teamMember.email,
            image: teamMember.image,
            role: teamMember.role,
            totalSprintTickets: teamMember.totalSprintTickets,
            inProgressTickets: teamMember.inProgressTickets,
            doneTickets: teamMember.doneTickets,
            tasks: teamMember.tasks,
            teamID: teamMember.teamID // Team information, if populated
        });
    } catch (error) {
        console.error('Error fetching team member:', error.message);
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


const updateTicketCountersHelper = async (userId) => {
    const user = await TeamMember.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    const totalTickets = user.tasks.length;
    const inProgressTickets = user.tasks.filter(task => task.status === 'inProgress').length;
    const doneTickets = user.tasks.filter(task => task.status === 'done').length;

    user.totalSprintTickets = totalTickets;
    user.inProgressTickets = inProgressTickets;
    user.doneTickets = doneTickets;

    await user.save();
};


//Put Request -> http://localhost:5000/team-members/:id/update-ticket-counters
const updateTicketCounters = async (req, res) => {
    try {
        const userId = req.params.id;

        // Call the helper function to update ticket counters
        await updateTicketCountersHelper(userId);

        // Fetch the updated user
        const user = await TeamMember.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Ticket counters updated successfully',
            totalSprintTickets: user.totalSprintTickets,
            inProgressTickets: user.inProgressTickets,
            doneTickets: user.doneTickets
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Post Request -> http://localhost:5000/team-members/:id/tasks
// {
//     "taskName": "Build Frontend",
//     "description": "Develop the user interface for the project",
//     "startDate": "2025-01-20",
//     "endDate": "2025-01-25",
//     "complexity": 3,
//     "status": "inProgress" --> (todo, inProgress, done)
// }
const addTask = async (req, res) => {
    try {
        const { taskName, description, startDate, endDate, complexity, status } = req.body;

        // Validate required fields
        if (!taskName || !complexity || !status) {
            return res.status(400).json({ message: 'taskName, complexity, and status are required' });
        }

        if (!['todo', 'inProgress', 'done'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const teamMember = await TeamMember.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Add the task to the team member's tasks
        teamMember.tasks.push({ taskName, description, startDate, endDate, complexity, status });

        // Save the user and update counters
        await teamMember.save();
        await updateTicketCountersHelper(req.params.id);

        res.status(200).json({
            message: 'Task added successfully',
            tasks: teamMember.tasks,
            totalSprintTickets: teamMember.totalSprintTickets,
            inProgressTickets: teamMember.inProgressTickets,
            doneTickets: teamMember.doneTickets
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//Put Request -> http://localhost:5000/team-members/:id/tasks/:taskId
// {
//     "taskName": "Update Backend API",
//     "description": "Enhance API functionality and improve performance",
//     "startDate": "2025-02-01",
//     "endDate": "2025-02-10",
//     "complexity": 4,
//     "status": "inProgress" --> (todo, inProgress, done)
// }

const updateTask = async (req, res) => {
    try {
        // Validate input
        if (!req.body.taskName && !req.body.status && !req.body.description) {
            return res.status(400).json({ message: 'At least one field is required to update the task' });
        }

        // Find the team member
        const teamMember = await TeamMember.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Find the task
        const task = teamMember.tasks.id(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Validate task status
        if (req.body.status && !['todo', 'inProgress', 'done'].includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid task status' });
        }

        // Update the task
        Object.assign(task, req.body);

        // Save changes and update counters
        await teamMember.save();
        await updateTicketCountersHelper(req.params.id);

        res.status(200).json({
            message: 'Task updated successfully',
            task,
            totalSprintTickets: teamMember.totalSprintTickets,
            inProgressTickets: teamMember.inProgressTickets,
            doneTickets: teamMember.doneTickets
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Delete Request -> http://localhost:5000/team-members/:id/tasks/:taskId
const deleteTask = async (req, res) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        const task = teamMember.tasks.id(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Remove the task from the tasks array
        task.remove();

        // Save the updated team member and update ticket counters
        await teamMember.save();
        await updateTicketCountersHelper(req.params.id); // Use the helper function for ticket counters

        res.status(200).json({
            message: 'Task removed successfully',
            totalSprintTickets: teamMember.totalSprintTickets,
            inProgressTickets: teamMember.inProgressTickets,
            doneTickets: teamMember.doneTickets
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//Get Request -> http://localhost:5000/team-members/:id/ticket-metrics
const getTicketMetrics = async (req, res) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        res.status(200).json({
            totalSprintTickets: teamMember.totalSprintTickets,
            inProgressTickets: teamMember.inProgressTickets,
            doneTickets: teamMember.doneTickets
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




//------------------------//May not need this function. Will keep for now depending on tests ----------------------------------------------
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
        // Find all team members
        const teamMembers = await TeamMember.find();

        // If no team members are found, return a 404 status
        if (!teamMembers) {
            return res.status(404).json({ message: 'No team members found' });
        }

        // Log the data for debugging
        console.log('Team Members Data:', teamMembers);

        // Send the response as a JSON object
        res.status(200).json(teamMembers);
    } catch (error) {
        console.error('Error fetching team members:', error.message);
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
    getAllTeamInfo,
    updateTicketCounters,
    getTicketMetrics
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