const express = require('express');
const router = express.Router();
const teamMemberController = require('../controllers/userControllers');

// Routes for managing team members
router.post('/register', teamMemberController.createTeamMember);
router.post('/login', teamMemberController.login);
router.get('/:id', teamMemberController.getTeamMemberById);
router.put('/:id', teamMemberController.updateTeamMember);
router.delete('/:id', teamMemberController.deleteTeamMember);

// Routes for managing tasks
router.post('/:id/tasks', teamMemberController.addTask);
router.put('/:id/tasks/:taskId', teamMemberController.updateTask);
router.delete('/:id/tasks/:taskId', teamMemberController.deleteTask);

module.exports = router;






// const express = require('express'); //common js module syntext 
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