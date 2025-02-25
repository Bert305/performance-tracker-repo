const express = require('express');//back-end web-framework
const colors =require('colors')
const dotenv = require('dotenv').config()//allows to use dotenv
const connectDB = require('./config/connectDB.js')
const session = require('express-session');
const port = process.env.PORT || 5000 
const app = express() //creates an instance of express
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./Module/userSchema'); // Ensure User model is imported
const cors = require("cors");//added recently to help the backend connect to the front-end
// const teamRoutes= require('./routes/teamRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const CardMovement = require('./Module/CardMovementSchema.js'); // Adjust the path as necessary
const Log = require('./Module/logSchema.js');
const TrelloBoard = require('./Module/trelloBoardSchema');
// const User = require('./Module/userSchema');
// const TrelloBoard = require('./Module/trelloBoardSchema');
// const TrelloTicket = require('./Modules/trelloTicketSchema');
const router = express.Router();











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
// app.use(express.json());
// // Parse URL-encoded bodies (as sent by HTML forms)
// app.use(express.urlencoded({ extended: true }));
const pug = require('pug');
const path = require('path');
// Set Pug as the template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

























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

// app.get('/', (req, res) => {
//   res.render('login.pug', {
//     title: 'Express Pug',
//     message: 'This is another sample page'
//   });
//   });

app.use(userRoutes);


const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const BASE_URL = process.env.BASE_URL;
const ID = process.env.ID;
const ID2 = process.env.ID2;
const defaultBoardId = process.env.BOARD_ID_DEFAULT;//Performance Tracker
const boardId1 = process.env.BOARD_ID_1;//Miami EdTech
const boardId2 = process.env.BOARD_ID_2;//GS Board




app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded



// Route to handle form submission
const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage }) // Assuming you're saving files in 'uploads/' directory

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/register-pug', (req, res) => {
  res.render('register.pug', {
    title: 'Register',
    message: 'Please register to continue'
  });
});

app.post('/register-pug', upload.single('image'), async (req, res) => {
  console.log(req.body);
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send('Username, password, and email are required').end();
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).redirect('/login-pug');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});


app.get('/login-pug', (req, res) => {
  res.render('login.pug', {
    title: 'login',
    message: 'Please register to continue'
  });
});



app.post('/login-pug', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid username or password');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token in session
    req.session.token = token;

    res.status(200).redirect('/account');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});



app.get('/account', (req, res) => {
  if (!req.session.token) {
    return res.redirect('/');
  }

  res.render('account.pug', {
    title: 'Account',
    message: 'Welcome to your account page'
  });
});


app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
      if (err) {
          console.error("Error destroying session: ", err);
          return res.status(500).send("Could not log out.");
      }
      res.redirect('/login-pug');
  });
});


app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login-pug');
  });
});

//---------------------------------------------------Complexity Page---------------------------------------------------


const getCustomFieldsForBoard = async (boardId) => {
  try {
    const response = await axios.get(`https://api.trello.com/1/boards/${boardId}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`);
    return response.data; // This will return all custom fields defined on the board
  } catch (error) {
    console.error('Failed to fetch custom fields:', error);
    throw error;
  }
};


const fetchCardsWithCustomFields = async (boardId) => {
  try {
    const response = await axios.get(`https://api.trello.com/1/boards/${boardId}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`);
    return response.data; // Returns all cards with custom field items included
  } catch (error) {
    console.error('Failed to fetch cards with custom fields:', error);
    throw error;
  }
};

const processCardsWithComplexity = async (boardId) => {
  const cards = await fetchCardsWithCustomFields(boardId);
  const customFields = await getCustomFieldsForBoard(boardId);

  // Find the ID of the Complexity custom field
  const complexityField = customFields.find(field => field.name === 'Complexity');
  const complexityFieldId = complexityField ? complexityField.id : null;

  if (!complexityFieldId) {
    console.log('Complexity field not found on the board');
    return [];
  }

  // Map cards to include complexity data
  const cardsWithComplexity = cards.map(card => {
    const complexityItem = card.customFieldItems.find(item => item.idCustomField === complexityFieldId);
    const complexity = complexityItem && complexityItem.value ? complexityItem.value.number : 'N/A';
    return {
      ...card,
      complexity
    };
  });

  return cardsWithComplexity;
};



const complexityDetails = async (boardId) => {
  try {
    const cardsWithComplexity = await processCardsWithComplexity(boardId);
    const { data } = await axios.get(`https://api.trello.com/1/boards/${boardId}?lists=open&members=all&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`);
    const { lists, members } = data;

    let memberDetails = members.map(member => ({
      id: member.id,
      username: member.username,
      fullName: member.fullName,
      cards: cardsWithComplexity.filter(card => card.idMembers.includes(member.id)).map(card => {
        const list = lists.find(list => list.id === card.idList);
        return {
          cardName: card.name,
          listName: list ? list.name : 'Unknown',
          complexity: card.complexity,
          activityDate: card.dateLastActivity ? new Date(card.dateLastActivity).toLocaleString() : 'N/A',
          dueDate: card.due ? new Date(card.due).toLocaleString() : 'N/A',
          hoursOnList: 'N/A' // Placeholder for actual logic to calculate hours
        };
      })
    }));

    return memberDetails; // Returns an array of member details including card complexity
  } catch (error) {
    console.error('Failed to fetch Trello board details:', error);
    throw error;
  }
};




app.get('/members-pug', async (req, res) => {
  const boardId = req.query.boardId || defaultBoardId;
  const memberId = req.query.memberId; // Get the selected memberId from query parameters

  try {
      const members = await complexityDetails(boardId); // Get all members for the selected board
      const filteredMembers = memberId ? members.filter(member => member.id === memberId) : members; // Filter members if memberId is provided

      res.render('members', {
          members: filteredMembers,  // Filtered members displayed
          allMembers: members, // Full list of members for the dropdown
          currentBoardId: boardId,
          selectedMemberId: memberId || "",  // Ensure selectedMemberId is always passed
          defaultBoardId,
          boardId1,
          boardId2
      });
  } catch (error) {
      console.error('Error fetching member data:', error);
      res.status(500).send('Error fetching member data');
  }
});




//-------------------------------------------^^^^^Complexity Page^^^^^---------------------------------------------------


const getBoardDetails = async (boardId) => {
  try {
    // Fetch board details including lists and cards
    const boardResponse = await axios.get(`https://api.trello.com/1/boards/${boardId}?cards=open&lists=open&members=all&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`);
    const { cards, lists, members } = boardResponse.data;

    // Initialize data structure to hold member card counts and list-specific counts
    const memberDetails = members.reduce((acc, member) => {
      acc[member.id] = {
        id: member.id,  // Ensure each member's data structure contains their ID
        username: member.username,
        fullName: member.fullName,
        totalCards: 0,
        cardsInList: lists.reduce((listAcc, list) => {
          listAcc[list.name] = 0;
          return listAcc;
        }, {})
      };
      return acc;
    }, {});
    

    // Map cards to their lists and update member details with card counts
    cards.forEach(card => {
      card.idMembers.forEach(memberId => {
        if (memberDetails[memberId]) {
          memberDetails[memberId].totalCards++;
          const list = lists.find(list => list.id === card.idList);
          if (list && memberDetails[memberId].cardsInList[list.name] !== undefined) {
            memberDetails[memberId].cardsInList[list.name]++;
          }
        }
      });
    });

    return memberDetails;  // Returns a detailed object with all member card counts
  } catch (error) {
    console.error('Failed to fetch Trello board details:', error);
    throw error;
  }
};

app.get('/dashboard-pug', async (req, res) => {
  const boardId = req.query.boardId || defaultBoardId;
  const memberId = req.query.memberId || ''; // Handle undefined memberId

  try {
    const members = await getBoardDetails(boardId);
    const filteredMembers = memberId ? Object.values(members).filter(member => member.id === memberId) : Object.values(members);

    res.render('dashboard', {
      members: filteredMembers,
      allMembers: Object.values(members), // Ensure all members are passed for dropdown
      currentBoardId: boardId,
      selectedMemberId: memberId,
      defaultBoardId,
      boardId1,
      boardId2
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Error fetching dashboard data');
  }
});




//need a web-hook to get hit by Trello API when a card gets moved from one list to another
//Create a web-hook to tell Trello to send a request to that end point. Should see console.log(“web hook hit“)




//step 1: Create Trello Webhook with description-------------------------------WORKED!!!---------------------------------
// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const fetch2 = require('node-fetch');
async function createWebhook() {
  console.log(app._router.stack);
  try {
    const response = await axios.post(`https://api.trello.com/1/webhooks/?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
      description: 'Miami_EdTech - Card Move Webhook',
      callbackURL: `${BASE_URL}/trello-webhook-Miami-EdTech`, // replace with your actual URL
      idModel: boardId2 // replace with your actual board ID
    });
    console.log('Webhook created:', response.data);
  } catch (error) {
    console.error('Error creating webhook:', error.response ? error.response.data : error.message);
  }
}
createWebhook() // Call the function to create the webhook



app.head('/trello-webhook-Miami-EdTech', (req, res) => {
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
const fetchWebhookStatus = async (webhookId) => {
  try {
    const response = await fetch2(`https://api.trello.com/1/webhooks/${webhookId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log(`Response: ${response.status} ${response.statusText}`);
    console.log(app._router.stack);
    const text = await response.text();
    console.log(text);
  } catch (err) {
    console.error(err);
  }
};

fetchWebhookStatus(ID);
fetchWebhookStatus(ID2);



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

  // Assume you have a Log model defined elsewhere
async function logMessage(message) {
  const logEntry = new Log({ message });
  await logEntry.save();
}
//----Will have to make a copy of this for each board matching the rout of the new webhook-------------------
//Post Request to see logs from the Performance Tracker Board
app.post('/trello-webhook', async (req, res) => {
  try {
    const { action } = req.body;
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    if (action && action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
      const cardID = action.data.card.id;
      const cardName = action.data.card.name;
      const fromList = action.data.listBefore.name;
      const toList = action.data.listAfter.name;
      const boardName = action.data.board.name;

      const logMessageText = `Card "${cardName}" moved from ${fromList} board name ${boardName}, to ${toList} at ${timestamp}`;
      console.log(logMessageText);
      await logMessage(logMessageText);

      try {
        await updateCard(cardID, fromList, { exitTimestamp: timestamp });
        console.log('Exit timestamp updated for:', cardName);
        await logMessage(`Exit timestamp updated for: ${cardName}`);
      } catch (error) {
        console.error('Error updating card movement:', error);
        await logMessage(`Error updating card movement: ${error.message}`);
        res.sendStatus(500);
        return;
      }

      try {
        await addCard(cardID, fromList, toList, cardName, timestamp);
        console.log('New movement added for:', cardName);
        await logMessage(`New movement added for: ${cardName}`);
      } catch (error) {
        console.error('Error adding card movement:', error);
        await logMessage(`Error adding card movement: ${error.message}`);
        res.sendStatus(500);
        return;
      }

      try {
        await getTimeInList(cardID, fromList, cardName);
      } catch (error) {
        console.error('Error calculating time in list:', error);
        await logMessage(`Error calculating time in list: ${error.message}`);
        res.sendStatus(500);
        return;
      }
    }
    res.sendStatus(200); // Send a response to acknowledge receipt of the webhook
  } catch (error) {
    console.error('Error processing webhook:', error);
    await logMessage(`Error processing webhook: ${error.message}`);
    res.sendStatus(500); // Send an error response if something goes wrong
  }
});


//Post Request to see logs from the GS Board
app.post('/trello-webhook-GS', async (req, res) => {
  try {
    const { action } = req.body;
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    if (action && action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
      const cardID = action.data.card.id;
      const cardName = action.data.card.name;
      const fromList = action.data.listBefore.name;
      const toList = action.data.listAfter.name;
      const boardName = action.data.board.name;

      const logMessageText = `Card "${cardName}" moved from ${fromList} board name ${boardName}, to ${toList} at ${timestamp}`;
      console.log(logMessageText);
      await logMessage(logMessageText);

      try {
        await updateCard(cardID, fromList, { exitTimestamp: timestamp });
        console.log('Exit timestamp updated for:', cardName);
        await logMessage(`Exit timestamp updated for: ${cardName}`);
      } catch (error) {
        console.error('Error updating card movement:', error);
        await logMessage(`Error updating card movement: ${error.message}`);
        res.sendStatus(500);
        return;
      }

      try {
        await addCard(cardID, fromList, toList, cardName, timestamp);
        console.log('New movement added for:', cardName);
        await logMessage(`New movement added for: ${cardName}`);
      } catch (error) {
        console.error('Error adding card movement:', error);
        await logMessage(`Error adding card movement: ${error.message}`);
        res.sendStatus(500);
        return;
      }

      try {
        await getTimeInList(cardID, fromList, cardName);
      } catch (error) {
        console.error('Error calculating time in list:', error);
        await logMessage(`Error calculating time in list: ${error.message}`);
        res.sendStatus(500);
        return;
      }
    }
    res.sendStatus(200); // Send a response to acknowledge receipt of the webhook
  } catch (error) {
    console.error('Error processing webhook:', error);
    await logMessage(`Error processing webhook: ${error.message}`);
    res.sendStatus(500); // Send an error response if something goes wrong
  }
});



//Post Request to see logs from the GS Board
app.post('/trello-webhook-Miami-EdTech', async (req, res) => {
  try {
    const { action } = req.body;
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    if (action && action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
      const cardID = action.data.card.id;
      const cardName = action.data.card.name;
      const fromList = action.data.listBefore.name;
      const toList = action.data.listAfter.name;
      const boardName = action.data.board.name;

      const logMessageText = `Card "${cardName}" moved from ${fromList} board name ${boardName}, to ${toList} at ${timestamp}`;
      console.log(logMessageText);
      await logMessage(logMessageText);

      try {
        await updateCard(cardID, fromList, { exitTimestamp: timestamp });
        console.log('Exit timestamp updated for:', cardName);
        await logMessage(`Exit timestamp updated for: ${cardName}`);
      } catch (error) {
        console.error('Error updating card movement:', error);
        await logMessage(`Error updating card movement: ${error.message}`);
        res.sendStatus(500);
        return;
      }

      try {
        await addCard(cardID, fromList, toList, cardName, timestamp);
        console.log('New movement added for:', cardName);
        await logMessage(`New movement added for: ${cardName}`);
      } catch (error) {
        console.error('Error adding card movement:', error);
        await logMessage(`Error adding card movement: ${error.message}`);
        res.sendStatus(500);
        return;
      }

      try {
        await getTimeInList(cardID, fromList, cardName);
      } catch (error) {
        console.error('Error calculating time in list:', error);
        await logMessage(`Error calculating time in list: ${error.message}`);
        res.sendStatus(500);
        return;
      }
    }
    res.sendStatus(200); // Send a response to acknowledge receipt of the webhook
  } catch (error) {
    console.error('Error processing webhook:', error);
    await logMessage(`Error processing webhook: ${error.message}`);
    res.sendStatus(500); // Send an error response if something goes wrong
  }
});



//--Will have to make a copy of this for each board changing the rout-------------------
//For The Performance Tracker Board Logs
app.get('/logs', async (req, res) => {
  try {
      const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
      res.set('Cache-Control', 'no-store, max-age=604800'); // Prevents caching of the page and sets max-age to 1 week (604800 seconds)
      res.render('logs', { logs });
  } catch (error) {
      console.error('Failed to fetch logs:', error);
      res.status(500).send('Error fetching logs');
  }
});
// For the GS Board Logs
// app.get('/logs2', async (req, res) => {
//   try {
//       const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
//       res.set('Cache-Control', 'no-store, max-age=604800'); // Prevents caching of the page and sets max-age to 1 week (604800 seconds)
//       res.render('logs2', { logs });
//   } catch (error) {
//       console.error('Failed to fetch logs:', error);
//       res.status(500).send('Error fetching logs');
//   }
// });



// app.post('/trello-webhook', async (req, res) => {
//   try {
//     const { action } = req.body;

//     if (action && action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
//       const cardID = action.data.card.id;
//       const cardName = action.data.card.name;
//       const fromList = action.data.listBefore.name;
//       const toList = action.data.listAfter.name;
//       const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });  // Current time in Eastern Standard Time when the card moved

//       console.log(`Card "${cardName}" moved from ${fromList} to ${toList} at ${timestamp}`);

//       // Ensure the exit timestamp is updated before adding a new movement and calculating time
//       try {
//         await updateCard(cardID, fromList, { exitTimestamp: timestamp });
//         console.log('Exit timestamp updated for:', cardName);
//       } catch (error) {
//         console.error('Error updating card movement:', error);
//         res.sendStatus(500);
//         return;
//       }

//       // Add a new record for the card entering a new list
//       try {
//         await addCard(cardID, fromList, toList, cardName, timestamp);
//         console.log('New movement added for:', cardName);
//       } catch (error) {
//         console.error('Error adding card movement:', error);
//         res.sendStatus(500);
//         return;
//       }

//       // Calculate the time in the previous list
//       try {
//         await getTimeInList(cardID, fromList, cardName);
//       } catch (error) {
//         console.error('Error calculating time in list:', error);
//         res.sendStatus(500);
//         return;
//       }
//     }
//     res.sendStatus(200); // Send a response to acknowledge receipt of the webhook
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     res.sendStatus(500); // Send an error response if something goes wrong
//   }
// });


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
      console.log(`Entry Timestamp: ${card.entryTimestamp}, Exit Timestamp: ${card.exitTimestamp}`); // Debugging line

      const entryDate = new Date(card.entryTimestamp);
      const exitDate = new Date(card.exitTimestamp);
      const duration = exitDate.getTime() - entryDate.getTime();
      const hours = (duration / 3600000).toFixed(2); // Converts milliseconds to hours

      console.log(`Card "${cardName}" was in list "${fromListName}" for ${hours} hours`);
    } else {
      console.log(`Incomplete data for calculating time in list for card "${cardName}". Maybe the exit timestamp has not been set or entry timestamp is missing.`);
    }
  } catch (error) {
    console.error(`Error calculating time in list for card "${cardName}":`, error);
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