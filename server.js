const express = require('express');//back-end web-framework
const colors =require('colors')
const dotenv = require('dotenv').config()//allows to use dotenv
const connectDB = require('./config/connectDB.js')
const session = require('express-session');
const port = process.env.PORT || 5000 
const app = express() //creates an instance of express
const axios = require('axios');
const cors = require("cors");//added recently to help the backend connect to the front-end
const teamRoutes= require('./routes/teamRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const CardMovement = require('./Module/CardMovementSchema.js'); // Adjust the path as necessary
const User = require('./Module/userSchema.js'); // Adjust the path as necessary
const Team = require('./Module/teamSchema.js'); // Adjust the path as necessary












// Session Management Middleware Configuration:
// This middleware sets up session management for the application using express-session.
// It handles session state in server memory, enabling user authentication and data persistence across requests.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // use true if using HTTPS, otherwise set to false
}));




// Parse JSON bodies (as sent by API clients)
app.use(express.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
const pug = require('pug');
const path = require('path');
// Set Pug as the template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// Teams Page
app.get('/teams-pug', (req, res) => {
  res.render('teams.pug', {
    title: 'Express Pug',
    message: 'Pug is a template engine for Express'
  });
});

// Route to handle form submission for teams
app.post('/teams-pug', async (req, res) => {
  const { teamName } = req.body;
  try {
    // Create a new team instance
    const newTeam = new Team({
      teamName
    });

    // Save the team to the database
    await newTeam.save();

    console.log('Team created:', req.body);
    res.send(`Team creation successful! Team ID: ${newTeam._id}`);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).send('Error creating team');
  }
});


app.get('/register-pug', async (req, res) => {
  res.render('register.pug', {
    title: 'Express Pug',
    message: 'This is another sample page'
  });
});


// Route to handle form submission
app.post('/register-pug', async (req, res) => {
  const { username, firstName, lastName, email, image, role, password } = req.body;
  try {
    // Create a new user instance
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      image,
      role,
      password
    });

    // Save the user to the database
    await newUser.save();

    console.log('User registered:', req.body);
    res.send('Registration successful!');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

app.get('/login-pug', (req, res) => {
  res.render('login.pug', {
    title: 'Express Pug',
    message: 'This is another sample page'
  });
});

// Route to handle form submission
app.post('/login-pug', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send('User not found');
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }

    // Set the user ID in the session
    req.session.userId = user._id;

    console.log('User logged in:', req.body);
    res.send('Login successful!');
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Error logging in user');
  }
});

app.get('/create-tasks-pug', (req, res) => {
  res.render('create-tasks.pug', {
    title: 'Express Pug',
    message: 'This is another sample page'
  });
});

// Route to handle form submission
app.post('/create-tasks-pug', (req, res) => {
  // Here you can add logic to save the task data to a database
  console.log('Task created:', req.body);
  res.send('Task creation successful!');
});
// User Account Page --------------------------HERE!!!---------------------------------
// app.get('/user-account-pug', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Please log in');
//   }

//   try {
//     const user = await User.findById(req.session.userId).populate({ path: 'team', strictPopulate: false }); // Assuming 'team' is a ref to another model
//     if (!user) {
//       return res.status(404).send('User not found');
//     }

//     const teams = await Team.find();

//     res.render('account.pug', {
//       title: 'User Account',
//       user: user,
//       teams: teams
//     });
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     res.status(500).send('Error fetching user data');
//   }
// });

app.get('/user-account-pug', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Please log in');
  }

  try {
    const user = await User.findById(req.session.userId).populate('teamID');
    if (!user) {
      return res.status(404).send('User not found');
    }

    const teams = await Team.find();

    res.render('account.pug', {
      title: 'User Account',
      user: user,
      teams: teams
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Error fetching user data');
  }
});





app.post('/user-account-pug', async (req, res) => {
  if (!req.session.userId) {
      return res.status(401).send('Please log in');
  }

  const { teamId, teamName } = req.body; // Extract both team ID and team name from the request

  try {
      const user = await User.findById(req.session.userId);
      if (!user) {
          return res.status(404).send('User not found');
      }

      // Update the user's team ID and team name
      user.team = teamId;
      user.teamName = teamName;
      await user.save();

      console.log('User team updated:', { teamId, teamName });
      res.redirect('/user-account-pug'); // Redirect to refresh the page with new data
  } catch (error) {
      console.error('Error updating user team:', error);
      res.status(500).send('Error updating user team');
  }
});

app.put('/user-account-pug', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Please log in');
  }

  const { teamId } = req.body; // Extract team ID from the request

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).send('Team not found');
    }

    // Update the user's team and team name
    user.team = teamId;
    user.teamName = team.teamName;
    await user.save();

    console.log('User team updated:', { teamId, teamName: team.teamName });
    res.send('Team updated successfully!');
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).send('Error updating team');
  }
});



app.get('/edit-account-pug', (req, res) => {
  res.render('edit-account.pug', {
    title: 'Express Pug',
    message: 'This is another sample page'
  });
});

app.post('/edit-account-pug', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Please log in');
  }

  const { username, firstName, lastName, email, image, role, password, teamName, teamID } = req.body;

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.username = username || user.username;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.image = image || user.image;
    user.role = role || user.role;
    user.password = password || user.password;
    user.teamName = teamName || user.teamName;
    user.teamID = teamID || user.teamID;

    await user.save();

    console.log('User updated:', req.body);
    res.send('Account updated successfully!');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
});




app.get('/edit-tasks-pug', (req, res) => {
  res.render('edit-tasks.pug', {
    title: 'Express Pug',
    message: 'This is another sample page'
  });
});

app.get('/dashboard-pug', async (req, res) => {
  try {
    const users = await User.find(); // Fetch user data from the database

    const teams = await Team.find(); // Fetch team data from the database

    res.render('dashboard.pug', {
      title: 'Express Pug',
      message: 'This is another sample page',
      users: users, // Pass user data to the template
      teams: teams  // Pass team data to the template
    });
  } catch (error) {
    res.status(500).send('Error fetching user data');
  }
});

// app.get('/dashboard-pug', async (req, res) => {
//   try {
//     const users = await User.find({}, 'username'); // Fetch user data with only username field

//     const teams = await Team.find({}, 'teamName'); // Fetch team data with only teamName field

//     res.render('dashboard.pug', {
//       title: 'Express Pug',
//       message: 'This is another sample page',
//       users: users, // Pass user data to the template
//       teams: teams  // Pass team data to the template
//     });
//   } catch (error) {
//     res.status(500).send('Error fetching user data');
//   }
// });


connectDB().then(() => {
  console.log('Database connected successfully');
}).catch((error) => {
  console.error('Database connection error:', error);
});

app.use(cors());//needed to execute cors
const bodyParser = require('body-parser'); 

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));//added recently to improve testing on postman
//allows us to connect our middleware to our routs.js file
// const myRoutes = require('./routes/userRoutes.js')
// //middle-ware-routs
// app.use('/api/user', myRoutes)

app.get('/', (req, res) => {
  res.render('login.pug', {
    title: 'Express Pug',
    message: 'This is another sample page'
  });
  });

app.use('/team-members', userRoutes);
app.use('/teams', teamRoutes);




//need a web-hook to get hit by Trello API when a card gets moved from one list to another
//Create a web-hook to tell Trello to send a request to that end point. Should see console.log(“web hook hit“)

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const BOARD_ID = process.env.BOARD_ID; // or use LIST_ID if you want to monitor a specific list
const BASE_URL = process.env.BASE_URL;
const ID = process.env.ID;


//step 1: Create Trello Webhook with description-------------------------------WORKED!!!---------------------------------
// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
// async function createWebhook() {
//   console.log(app._router.stack);
//   try {
//     const response = await axios.post(`https://api.trello.com/1/webhooks/?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
//       description: 'Card Move Webhook',
//       callbackURL: `${BASE_URL}/trello-webhook`, // replace with your actual URL
//       idModel: BOARD_ID,
//     });
//     console.log('Webhook created:', response.data);
//   } catch (error) {
//     console.error('Error creating webhook:', error.response ? error.response.data : error.message);
//   }
// }
// createWebhook() // Call the function to create the webhook



app.head('/trello-webhook', (req, res) => {
  res.status(200).send();
  console.log('Webhook response received works!');
});


// app.post('/trello-webhook', (req, res) => {
//   console.log('Webhook received:', req.body);
//   res.status(200).send('Webhook response received test');
// });




// const fetch = require('node-fetch');

// fetch(`https://api.trello.com/1/webhooks/?callbackURL=${BASE_URL}/trello-webhook&idModel=${BOARD_ID}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
//   method: 'POST',
//   headers: {
//     'Accept': 'application/json'
//   }
// })
//   .then(response => {
//     console.log(
//       `Response: ${response.status} ${response.statusText}`
//     );
//     return response.text();
//   })
//   .then(text => console.log(text))
//   .catch(err => console.error(err));

//   app.post('/trello-webhook', (req, res) => {
//     res.status(200).send('OK');
//     console.log(response.status);
// });


// async function createWebhook() {
//   const apiKey = TRELLO_API_KEY; // Replace 'yourAPIKey' with your Trello API key
//   const token = TRELLO_TOKEN; // Replace 'yourToken' with your Trello token
//   const callbackURL = `${BASE_URL}/trello-webhook`; // Replace with your Heroku app's URL
//   const idModel = BOARD_ID; // Replace 'yourModelId' with the ID of the Trello board or card you want to monitor

//   const url = 'https://api.trello.com/1/webhooks/';

//   const data = {
//       description: 'My Trello webhook',
//       callbackURL,
//       idModel,
//   };

//   try {
//       const response = await axios.post(url, data, {
//           params: {
//               key: apiKey,
//               token: token
//           }
//       });
//       console.log('Webhook created successfully:', response.data);
//   } catch (error) {
//       console.error('Error creating webhook:', error.response.data);
//   }
// }

// createWebhook();



//------------------------------------update webhook--------------------------------------------
//Update Trello Webhook

// const updateWebhook = async () => {
//     const apiKey = TRELLO_API_KEY;
//     const token = TRELLO_TOKEN;
//     const webhookId = ID;
//     const newCallbackURL = `${BASE_URL}trello-webhook`;
//     const newModelID = BOARD_ID;

//      const url = `https://api.trello.com/1/webhooks/${webhookId}`;

//     try {
//         const response = await axios.put(url, null, {
//             params: {
//                 key: apiKey,
//                 token: token,
//                 idModel: newModelID, // Update the model ID if needed
//                 callbackURL: newCallbackURL,
//                 active: true // Reactivate the webhook if it was deactivated
//             }
//         });
//         console.log('Webhook updated successfully:', response.data);
//     } catch (error) {
//         console.error('Error updating webhook:', error.response ? error.response.data : error.message);
//     }
// };

// updateWebhook();


//step 2: Get Status of Trello Webhook
// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const fetch2 = require('node-fetch');

fetch2(`https://api.trello.com/1/webhooks/${ID}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
})
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    console.log(app._router.stack);
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));


// // web-hook end-point----------------------------------This works!!!! Please keep it commented out for now!!-------------------------------------
// app.post('/trello-webhook', (req, res) => {

//   console.log('Received webhook event:', JSON.stringify(req.body, null, 2));

//   const { action } = req.body;

//   //Respond with 200 OK to acknowledge receipt of the webhook
//   res.sendStatus(200);

//   //check if the action is a card move
//   if (action && action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
//     const cardID = action.data.card.id;
//     const cardName = action.data.card.name;
//     const fromList = action.data.listBefore.name;
//     const toList = action.data.listAfter.name;

//     console.log(`Card "${cardName}" was moved from "${fromList}" to "${toList}".`);
//   }
//   else {
//     console.log('No card move action detected.');
//   }
// });

//----------------------------This is to check the time stamp of the card movements-------------------------------------
// Finds an existing card movement document that hasn't been completed yet

app.post('/trello-webhook', async (req, res) => {
  try {
    const { action } = req.body;

    if (action && action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
      const cardID = action.data.card.id;
      const cardName = action.data.card.name;
      const fromList = action.data.listBefore.name;
      const toList = action.data.listAfter.name;
      const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });  // Current time in Eastern Standard Time when the card moved

      console.log(`Card "${cardName}" moved from ${fromList} to ${toList} at ${timestamp}`);

      // Ensure the exit timestamp is updated before adding a new movement and calculating time
      try {
        await updateCard(cardID, fromList, { exitTimestamp: timestamp });
        console.log('Exit timestamp updated for:', cardName);
      } catch (error) {
        console.error('Error updating card movement:', error);
        res.sendStatus(500);
        return;
      }

      // Add a new record for the card entering a new list
      try {
        await addCard(cardID, fromList, toList, cardName, timestamp);
        console.log('New movement added for:', cardName);
      } catch (error) {
        console.error('Error adding card movement:', error);
        res.sendStatus(500);
        return;
      }

      // Calculate the time in the previous list
      try {
        await getTimeInList(cardID, fromList, cardName);
      } catch (error) {
        console.error('Error calculating time in list:', error);
        res.sendStatus(500);
        return;
      }
    }
    res.sendStatus(200); // Send a response to acknowledge receipt of the webhook
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500); // Send an error response if something goes wrong
  }
});


function updateCard(cardID, fromListName, updates) {
  return CardMovement.findOneAndUpdate({
    cardID: cardID,
    fromListName: fromListName,
    exitTimestamp: { $exists: false }
  }, updates, { new: true });
}


function addCard(cardID, fromList, toList, cardName, timestamp) {
  const newMovement = new CardMovement({
    cardID: cardID,
    cardName: cardName,
    fromListName: fromList,
    toListName: toList,
    entryTimestamp: timestamp
  });
  return newMovement.save();
}

function findCard(cardID, fromListName) {
  return CardMovement.findOne({
    cardID: cardID,
    fromListName: fromListName,  // Ensure it matches the schema field name
    exitTimestamp: { $exists: true }  // Looking for completed movements
  }).sort({ exitTimestamp: -1 }); // Sort by exitTimestamp in descending order to get the latest movement
}


//calculate time in list by hours
async function getTimeInList(cardID, fromListName, cardName) {
  try {
    const card = await findCard(cardID, fromListName);
    if (card && card.entryTimestamp && card.exitTimestamp) {
      const duration = new Date(card.exitTimestamp).getTime() - new Date(card.entryTimestamp).getTime();
      const hours = (duration / 3600000).toFixed(2); // 1000 * 60 * 60

      console.log(`Card "${cardName}" was in list "${fromListName}" for ${hours} hours`);
    } else {
      console.log(`Incomplete data for calculating time in list for card "${cardName}". Maybe the exit timestamp has not been set.`);
    }
  } catch (error) {
    console.error('Error calculating time in list for card:', cardName, error);
  }
}







//----------------------------------This is the request made as a plan b to console log card movements-------------------------------------

//Postman (Potter Gather Data of the board)-> GET http://localhost:5000/trello-actions
let cachedActions = [];  // Define a variable to store the actions data
app.get('/trello-actions', async (req, res) => {
  try {
    const response = await axios.get(`https://api.trello.com/1/boards/${BOARD_ID}/actions?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`);
    cachedActions = response.data;  // Store data in cachedActions for later use
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching actions:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching actions');
  }
});

// Step 2: Access cachedActions data here
//Postman (Potter get data of card status)-> GET http://localhost:5000/use-trello-actions
app.get('/use-trello-actions', (req, res) => {
  // Process or log cached actions data here
  if (cachedActions.length === 0) {
    return res.status(404).send("No cached actions data available.");
  }

  // Example: Log each action's details
  cachedActions.forEach(action => {
    if (action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
      const cardName = action.data.card.name;
      const fromList = action.data.listBefore.name;
      const toList = action.data.listAfter.name;

      console.log(`Card "${cardName}" was moved from "${fromList}" to "${toList}".`);
    }
  });

  res.send("Cached actions data has been processed.");
});
//----------------------------------This is the request made as a plan b to console log card movements-------------------------------------


// createWebhook();




//port listener
app.listen(port,()=>{
    console.log(`Our server port ${port} is running!!!!`)
});