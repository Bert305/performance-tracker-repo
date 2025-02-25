const User = require('../Module/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TrelloBoard = require('../Module/trelloBoardSchema');
const axios = require('axios');
// const TrelloTicket = require('../Modules/trelloTicketSchema');
const dotenv = require('dotenv').config()//allows to use dotenv
require('dotenv').config();

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const BOARD_ID = process.env.BOARD_ID; // or use LIST_ID if you want to monitor a specific list
const BASE_URL = process.env.BASE_URL;
const ID = process.env.ID;
//GET Request -> http://localhost:5000/test
const test = (req, res) => {
    console.log(req.headers); // Example usage of req
    res.send('Test route, Hello World!');
}

// Apply authenticateToken middleware to the dashboard route
// Middleware to verify JWT
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   console.log('Authorization Header:', authHeader);  // Check what is received exactly

//   if (!authHeader) {
//       console.log('Authorization header is missing');
//       return res.status(401).send('Authorization header is missing');
//   }

//   const parts = authHeader.split(' ');
//   if (parts.length !== 2 || parts[0] !== 'Bearer') {
//       console.log('Authorization header is not Bearer or is improperly formatted');
//       return res.status(401).send('Authorization header is not Bearer or is improperly formatted');
//   }

//   const token = parts[1];
//   jwt.verify(token, 'your_jwt_secret', (err, user) => {
//       if (err) {
//           console.log('Token verification failed:', err.message);
//           return res.sendStatus(403);
//       }
//       req.user = user;
//       next();
//   });
// }



  // Register new team member
//POST Request -> http://localhost:5000/register

// Body for Postman
// {
//     "username": "john_doe",
//     "password": "password123",
// }
  // Register new user
  const register = async (req, res) => {
    const { username, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  // Login team member
// POST Request -> http://localhost:5000/login

// Body for Postman
// {
//     "username": "john_doe",
//     "password": "password123"
// }
  // User login
  const login = async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(403).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '72h' });
      res.json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  // GET Request -> http://localhost:5000/dashboard
  // Get user boards and tickets
  const dashboard = async (req, res) => {
    const userId = req.user.id;  // Assuming req.user is set from your authentication middleware

    try {
        // Fetching board actions from the Trello API
        const trelloUrl = `https://api.trello.com/1/boards/${BOARD_ID}/actions?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
        const trelloResponse = await axios.get(trelloUrl, { headers: { 'Accept': 'application/json' } });
        const boardActions = trelloResponse.data;

        // Fetch user's boards and tickets from MongoDB
        const user = await User.findById(userId).populate({
            path: 'boards',  // Ensure your User schema correctly references 'boards'
            populate: {
                path: 'tickets',  // And that your Board schema correctly references 'tickets'
                model: 'TrelloTicket'  // Ensure this is your ticket model
            }
        });

        if (!user || !user.boards) {
            console.error('No boards found for this user.');
            return res.status(404).send('No boards found for this user.');
        }

        // Format the MongoDB boards data
        const boardsData = user.boards.map(board => ({
            boardName: board.name,
            boardId: board._id,
            tickets: board.tickets.map(ticket => ({
                ticketTitle: ticket.title,
                ticketDescription: ticket.description,
                status: ticket.status,
                assignedTo: ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'
            }))
        }));

        // Combine Trello board actions with local boards data
        res.json({
            user: user.username,
            boards: boardsData,
            trelloBoardActions: boardActions  // This includes action data directly from Trello
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send('Error fetching dashboard data');
    }
};


// Controller to fetch and organize Trello board user and card data
const getTrelloUserData = async (req, res) => {
  try {
      const trelloUrl = `https://api.trello.com/1/boards/${BOARD_ID}/actions?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
      const trelloResponse = await axios.get(trelloUrl, { headers: { 'Accept': 'application/json' } });
      const actions = trelloResponse.data;

      // Extract user and card data from actions
      const users = {};
      actions.forEach(action => {
          if (action.memberCreator) {
              const { id, fullName, username, avatarHash } = action.memberCreator;
              // Initialize user if not already in the dictionary
              if (!users[id]) {
                  users[id] = {
                      fullName,
                      username,
                      avatarUrl: avatarHash ? `https://trello-avatars.s3.amazonaws.com/${avatarHash}/50.png` : null,
                      cards: []
                  };
              }
              // Add card details if action involves a card
              if (action.data && action.data.card) {
                  users[id].cards.push({
                      cardId: action.data.card.id,
                      cardName: action.data.card.name
                  });
              }
          }
      });

      res.json({
          users: Object.values(users)  // Convert dictionary to array of user objects
      });
  } catch (error) {
      console.error("Error fetching Trello board user data:", error);
      res.status(500).send('Error fetching data from Trello');
  }
};

 // GET Request -> http://localhost:5000/trello-board
  // Get user boards and tickets
const getTrelloBoardData = async (req, res) => {


    const url = `https://api.trello.com/1/boards/${BOARD_ID}/actions?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        // Assuming the response data is what you want to send back to the client
        res.json(response.data);
    } catch (error) {
        console.error('Failed to fetch Trello board data:', error);
        res.status(500).send('Failed to fetch data from Trello');
    }
};



// GET Request -> http://localhost:5000/boards
// Get user boards and tickets
// Manage boards and tickets
const boards = async (req, res) => {
    const { name, tickets } = req.body;
    const newBoard = new TrelloBoard({ name, tickets, users: [req.user.id] });
    try {
      await newBoard.save();
      await User.findByIdAndUpdate(req.user.id, { $push: { boards: newBoard._id } });
      res.status(201).json(newBoard);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};






  // Connect the Trello API to get real-time updates
  const trelloUpdates = async (req, res) => {
    try {
      const response = await axios.get(`https://api.trello.com/1/boards/${BOARD_ID}/actions?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


module.exports = {
    test,
    login,
    dashboard,
    register,
   trelloUpdates,
   boards,
  //  authenticateToken,
   getTrelloBoardData,
   getTrelloUserData
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