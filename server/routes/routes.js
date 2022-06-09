
const express = require('express'); //common js module syntext 
const router = express.Router();
const {getUsers, postUser, editUser, deleteUser, getOneUser} = require('../controllers/userControllers')


// router.route('/').get(getUsers).post(postUser) ---could use to save lines of code
// router.route('/:id').delete(deleteUser).put(editUser)


//our routes
router.get('/', getUsers)
router.get('/:id', getOneUser)
router.post('/', postUser)
router.put('/:id', editUser)
router.delete('/:id', deleteUser)




module.exports = router