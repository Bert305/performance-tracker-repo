const User = require('../Module/userSchema')

//get all users
//@route get /api/user
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users)
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
}

//get one user
const getOneUser = async (req,res)=>{
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        res.status(200).json(user)
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
}

//post new user
//@route post /api/user
const postUser = async (req, res) => {
    try {
        console.log(req.body)
        const newUser = new User({ ...req.body});
        if (await newUser.save()) {
            res.status(200).json(newUser)
        }
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
}
//edit existing user
//@route put /api/user/:id
const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
          new: true,
        });
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}
//delete existing user
//@route delete /api/user/:id
const deleteUser = async (req, res) => {
    try {
        const {id} = req.params;
        if ( await User.findByIdAndDelete(id)) {
            res.status(200).send("This user has been deleted");
        }
    }
    catch (error) {
            res.status(500).json({error: error.message});
    }
}

module.exports = {
    getUsers,
    postUser,
    editUser,
    deleteUser,
    getOneUser 
}