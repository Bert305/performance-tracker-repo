
const TeamMember = require('../Module/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register new team member
exports.createTeamMember = async (req, res) => {
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
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const teamMember = await TeamMember.findOne({ username });

        if (!teamMember) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, teamMember.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: teamMember._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get team member by ID
exports.getTeamMemberById = async (req, res) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id).populate('teamID');
        if (!teamMember) return res.status(404).json({ message: 'Team member not found' });
        res.json(teamMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update team member
exports.updateTeamMember = async (req, res) => {
    try {
        const updatedTeamMember = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTeamMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete team member
exports.deleteTeamMember = async (req, res) => {
    try {
        await TeamMember.findByIdAndDelete(req.params.id);
        res.json({ message: 'Team member deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add task to team member
exports.addTask = async (req, res) => {
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
exports.updateTask = async (req, res) => {
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
exports.deleteTask = async (req, res) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id);
        teamMember.tasks.id(req.params.taskId).remove();
        await teamMember.save();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




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