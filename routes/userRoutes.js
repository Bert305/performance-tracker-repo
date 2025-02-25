const express = require('express');
const router = express.Router();
const {test, login, register, dashboard, boards, getTrelloBoardData, getTrelloUserData} = require('../controllers/userControllers')

// Route for testing
router.get('/test', test);
// Routes for managing team members
router.post('/register', register);
router.post('/login', login);
router.get('/dashboard', dashboard);
router.get('/boards', boards);
router.get('/trello-board', getTrelloBoardData);
router.get('/trello-users', getTrelloUserData);

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