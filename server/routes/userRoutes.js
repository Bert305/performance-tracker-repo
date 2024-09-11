const express = require('express');
const router = express.Router();
const {createTeamMember, test, login, getTeamMemberById, updateTeamMember, deleteTeamMember, addPerformanceMetrics, logout, addTask, updateTask, deleteTask, getAllTeamInfo} = require('../controllers/userControllers')

// Route for testing
router.get('/test', test);

// Routes for managing team members
router.post('/register', createTeamMember);
router.post('/login', login);
router.get('/:id', getTeamMemberById);
router.put('/:id', updateTeamMember);
router.delete('/:id', deleteTeamMember);

router.post('/logout', logout);

// Routes for managing tasks
router.post('/:id/tasks', addTask);
router.put('/:id/tasks/:taskId', updateTask);
router.delete('/:id/tasks/:taskId', deleteTask);

// Add performance metrics for a specific team member
router.put('/:id/performance-metrics', addPerformanceMetrics);


// Get all team members with tasks, team info, and performance metrics
router.get('/:id/team-info', getAllTeamInfo);


module.exports = router;






// const express = require('express'); //common js module syntax
// const router = express.Router();
// const {getUsers, postUser, editUser, deleteUser, getOneUser} = require('../controllers/userControllers')


// // router.route('/').get(getUsers).post(postUser) ---could use to save lines of code
// // router.route('/:id').delete(deleteUser).put(editUser)


// //our routes
// router.get('/', getUsers)
// router.get('/:id', getOneUser)
// router.post('/', postUser)
// router.put('/:id', editUser)
// router.delete('/:id', deleteUser)




// module.exports = router