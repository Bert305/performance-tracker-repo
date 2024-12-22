const express = require('express');//back-end web-framework
const colors =require('colors')
const dotenv = require('dotenv').config()//allows to use dotenv
const connectDB = require('./config/connectDB.js')
const port = process.env.PORT || 5000 
const app = express() //creates an instance of express
const axios = require('axios');
const cors = require("cors");//added recently to help the backend connect to the front-end
const teamRoutes= require('./routes/teamRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

const pug = require('pug');
const path = require('path');
// Set Pug as the template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.get('/sample-pug', (req, res) => {
  res.render('sample.pug', {
    title: 'Express Pug',
    message: 'Pug is a template engine for Express'
  });
});
app.get('/register-pug', (req, res) => {
  res.render('register.pug', {
    title: 'Express Pug',
    message: 'This is another sample page'
  });
});
app.get('/login-pug', (req, res) => {
  res.render('login.pug', {
    title: 'Express Pug',
    message: 'This is another sample page'
  });
});
app.get('/create-tasks-pug', (req, res) => {
  res.render('create-tasks.pug', {
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


connectDB()//connects our Atlas cluster

app.use(cors());//needed to execute cors
const bodyParser = require('body-parser'); 
const User = require('./Module/userSchema.js'); // Adjust the path as necessary
const Team = require('./Module/teamSchema.js'); // Adjust the path as necessary
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));//added recently to improve testing on postman
//allows us to connect our middleware to our routs.js file
// const myRoutes = require('./routes/userRoutes.js')
// //middle-ware-routs
// app.use('/api/user', myRoutes)

app.get('/', (req, res) => {
    res.send('Hello World!');
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

// Step 1: Create Trello Webhook
// async function createWebhook() {
//   try {
//     const response = await axios.post(`https://api.trello.com/1/webhooks/?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
//       description: 'Card Move Webhook',
//       callbackURL: `${BASE_URL}trello-webhook`, // replace with your actual URL
//       idModel: BOARD_ID,
//     });
//     console.log('Webhook created:', response.data);
//   } catch (error) {
//     console.error('Error creating webhook:', error.response ? error.response.data : error.message);
//   }
// }


//step 1: Create Trello Webhook
// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const fetch = require('node-fetch');

fetch(`https://api.trello.com/1/webhooks/?callbackURL=${BASE_URL}&idModel=${BOARD_ID}&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
  method: 'POST',
  headers: {
    'Accept': 'application/json'
  }
})
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));

//Update Trello Webhook

// const updateWebhook = async () => {
//     const apiKey = TRELLO_API_KEY;
//     const token = TRELLO_TOKEN;
//     const webhookId = ID;
//     const newCallbackURL = BASE_URL;

//     const url = `https://api.trello.com/1/webhooks/${webhookId}`;

//     try {
//         const response = await axios.put(url, null, {
//             params: {
//                 key: apiKey,
//                 token: token,
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
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));


//Step 3: Get updates of the Trello Webhook hit with console log
//web-hook end-point
app.post(`${BASE_URL}trello-webhook`, (req, res) => {
  
  // Log the entire payload for inspection
  console.log('Received webhook event:', JSON.stringify(req.body, null, 4));

  const { action } = req.body;

  // Respond immediately to acknowledge Trello's request
  res.sendStatus(200);

  // Check if we received an updateCard action with list movement details
  if (action && action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
  const cardId = action.data.card.id;
  const cardName = action.data.card.name;
  const fromList = action.data.listBefore.name;
  const toList = action.data.listAfter.name;

  console.log(`Card "${cardName}" was moved from "${fromList}" to "${toList}".`);
  } else {
  console.log('Received action is not a card movement.');
  }
});









//----------------------------------This is the request made as a plan b to console log card movements-------------------------------------

// app.get('/trello-actions', async (req, res) => {
//   try {
//     const response = await axios.get(`https://api.trello.com/1/boards/${BOARD_ID}/actions?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`);
//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching actions:', error.response ? error.response.data : error.message);
//     res.status(500).send('Error fetching actions');
//   }
// });
// something I made to console log some data from postman as an alternative to the above code
let cachedActions = [];  // Define a variable to store the actions data
console.log(app._router.stack);
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