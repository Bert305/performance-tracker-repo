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



app.get('/logout-pug', function(req, res) {
  req.session.destroy(function(err) {
      if (err) {
          console.error("Error destroying session: ", err);
          return res.status(500).send("Could not log out.");
      }
      res.redirect('/login-pug');
  });
});



// Route to handle form submission
const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage }).single('image'); // Assuming you're saving files in 'uploads/' directory

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to handle form submission
app.post('/register-pug', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send('Error uploading file: ' + err);
    }

    // After file is uploaded, handle the registration process
    const { username, firstName, lastName, email, role, password } = req.body;
    // Normalize the file path before saving it to the database
    const image = req.file ? req.file.path.replace(/\\/g, '/').replace('public/uploads/', '') : '';

    try {
      const newUser = new User({
        username,
        firstName,
        lastName,
        email,
        image,  // Use the normalized image path
        role,
        password
      });

      await newUser.save();
      console.log('User registered:', req.body);
      res.redirect('/login-pug'); // Redirect to login page after successful registration
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Error registering user');
    }
  });
});



app.get('/edit-account-pug', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Please log in');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('edit-account.pug', {
      title: 'Edit Account',
      user: user
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Error fetching user data');
  }
});



// edit user account
const storage2 = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload2 = multer({ storage: storage2 });

app.post('/edit-account-pug', upload2.single('image'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Please log in');
  }

  try {
    const { username, firstName, lastName, email, role, password, teamName, teamID } = req.body;
    let image = req.file ? `/uploads/${req.file.filename}` : undefined; // Store only filename

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // ✅ Update only fields that were provided
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (image) user.image = image; // Update image only if a new one is uploaded
    if (role) user.role = role;
    if (password) user.password = password;
    if (teamName) user.teamName = teamName;
    if (teamID) user.teamID = teamID;

    await user.save();

    console.log('User updated:', user);
    res.redirect('/user-account-pug');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
});

app.put('/edit-account-pug', upload2.single('image'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Please log in');
  }

  try {
    const { username, firstName, lastName, email, role, password, teamName, teamID } = req.body;
    let image = req.file ? `/uploads/${req.file.filename}` : undefined; // Store only filename

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // ✅ Update only fields that were provided
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (image) user.image = image; // Update image only if a new one is uploaded
    if (role) user.role = role;
    if (password) user.password = password;
    if (teamName) user.teamName = teamName;
    if (teamID) user.teamID = teamID;

    await user.save();

    console.log('User updated:', user);
    res.send('User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
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
    res.redirect('/user-account-pug'); // Redirect to user account page after successful login
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



app.get('/edit-task-pug/:taskId', async (req, res) => {
    try {
        // Assuming you have some way to identify the correct user; possibly from session or a parameter
        const user = await User.findOne({"tasks._id": req.params.taskId}); // Find the user with the task
        if (!user) {
            return res.status(404).send('User not found');
        }

        const task = user.tasks.id(req.params.taskId); // Get the specific task
        if (!task) {
            return res.status(404).send('Task not found');
        }

        res.render('edit-tasks.pug', { task }); // Pass the task to your Pug template
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).send('Error fetching task data');
    }
});




// Task Creation Route
app.post('/create-tasks-pug', async (req, res) => {
  const { taskName, description, startDate, endDate, complexity, status } = req.body;
  const assignedDate = new Date(startDate + 'T23:59:59'); // Use the startDate from the form
  const dueDate = new Date(endDate + 'T23:59:59'); // Ensure the end date is interpreted correctly

  try {
      const user = await User.findById(req.session.userId);
      if (!user) {
          return res.status(404).send('User not found');
      }

      // Construct the task object including the dueDate
      const task = { taskName, description, assignedDate, dueDate, complexity, status };
      user.tasks.push(task);
      await user.save();

      // Optionally, recalculate task metrics after adding the task
      await recalculateTaskMetrics(req.session.userId);

      res.redirect('/user-account-pug');
  } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).send('Error creating task');
  }
});




app.put('/edit-task-pug/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { taskName, description, startDate, endDate, complexity, status } = req.body;

  try {
      const user = await User.findById(req.session.userId);
      if (!user) {
          return res.status(404).send('User not found');
      }

      const task = user.tasks.id(taskId); // Fetch the task from the tasks array by ID
      if (!task) {
          console.log('Task ID provided:', taskId);
          console.log('Available Task IDs:', user.tasks.map(t => t._id.toString()));
          return res.status(404).send('Task not found');
      }

      // Update task fields including handling of date with specified time
      task.taskName = taskName || task.taskName;
      task.description = description || task.description;
      task.assignedDate = startDate ? new Date(startDate + 'T23:59:59') : task.assignedDate;
      task.dueDate = endDate ? new Date(endDate + 'T23:59:59') : task.dueDate;
      task.complexity = complexity || task.complexity;
      task.status = status || task.status;

      await user.save(); // Save changes to user document

      // Mark the tasks array as modified to help Mongoose detect the change
      user.markModified('tasks');
      await user.save();
      
      // Recalculate task metrics after the task has been updated
      await recalculateTaskMetrics(req.session.userId);

      res.redirect('/user-account-pug'); // Redirect to user account page after successful update
  } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).send('Error updating task');
  }
});





app.post('/edit-task-pug/:taskId', async (req, res) => {
  const { taskName, description, startDate, endDate, complexity, status } = req.body;
  const userId = req.session.userId; // Assuming you store userId in session

  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).send('User not found');
      }

      const task = user.tasks.id(req.params.taskId); // Find the task by ID
      if (!task) {
          return res.status(404).send('Task not found');
      }

      // Update task fields, including assigned and due dates
      task.taskName = taskName || task.taskName;
      task.description = description || task.description;
      task.assignedDate = startDate ? new Date(startDate + 'T23:59:59') : task.assignedDate;
      task.dueDate = endDate ? new Date(endDate + 'T23:59:59') : task.dueDate;
      task.complexity = complexity || task.complexity;
      task.status = status || task.status;

      // Use markModified on dates if mongoose does not recognize changes in dates
      user.markModified('tasks');

      await user.save(); // Save the user document with the updated task

      // Recalculate and update task metrics
      await recalculateTaskMetrics(userId);

      res.redirect('/user-account-pug'); // Redirect or respond after successful task update
  } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).send('Error updating task');
  }
});









async function recalculateTaskMetrics(userId) {
  try {
      const user = await User.findById(userId);
      if (!user) {
          console.error('User not found');
          return;
      }

      user.totalSprintTickets = user.tasks.length;
      user.inProgressTickets = user.tasks.filter(task => task.status === 'inProgress').length;
      user.doneTickets = user.tasks.filter(task => task.status === 'done').length;

      await user.save();
  } catch (error) {
      console.error('Error recalculating task metrics:', error);
  }
}



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
    const user = await User.findById(req.session.userId).populate('teamID').populate('tasks'); // Corrected populate path and added tasks
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



// Assuming you have Express and your User model imported and set up

// Endpoint to update user's team
app.post('/update-user-team', async (req, res) => {
  const { teamId } = req.body; // Get the teamId from the request body
  const userId = req.session.userId; // Assuming you store logged-in userId in session

  if (!teamId) {
      return res.status(400).json({ success: false, message: "Team ID is required." });
  }

  try {
      // Update the user's teamID in the database
      const updatedUser = await User.findByIdAndUpdate(userId, { teamID: teamId }, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ success: false, message: "User not found." });
      }

      res.json({ success: true, message: "Team updated successfully.", user: updatedUser });
  } catch (error) {
      console.error('Update User Team Error:', error);
      res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.delete('/remove-task/:taskId', async (req, res) => {
  console.log(`Received DELETE request for task: ${req.params.taskId}`);

  if (!req.session.userId) {
    console.error("❌ User not logged in");
    return res.status(401).json({ success: false, message: "Please log in" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error("❌ User not found in database");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ensure user has tasks
    if (!user.tasks || user.tasks.length === 0) {
      console.error("❌ User has no tasks");
      return res.status(400).json({ success: false, message: "No tasks found" });
    }

    // 🔥 Log the current tasks before removing
    console.log("✅ Before removal:", user.tasks.map(task => task._id.toString()));

    // 🔥 Remove the task
    const updatedTasks = user.tasks.filter(task => task._id.toString() !== req.params.taskId);
    
    // If no task was removed, log it
    if (updatedTasks.length === user.tasks.length) {
      console.error("❌ Task not found in user's list");
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    user.tasks = updatedTasks;
    await user.save();

    // Recalculate task metrics after removing the task
    await recalculateTaskMetrics(req.session.userId);

    console.log(`✅ Task ${req.params.taskId} removed successfully`);
    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Error removing task:', error);
    return res.status(500).json({ success: false, message: "Error removing task" });
  }
});





// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage: storage }).single('image');





app.get('/dashboard-pug', async (req, res) => {
  try {
      const { teamId } = req.query; // Capture the teamId from the request query parameters
      let users;
      const teams = await Team.find(); // Fetch all teams for the dropdown

      if (teamId) {
          users = await User.find({ teamID: teamId }).populate('teamID'); // Filter users by teamID
      } else {
          users = await User.find().populate('teamID'); // Fetch all users if no specific team is selected
      }

      res.render('dashboard', {
          users: users,
          teams: teams
      });
  } catch (error) {
      console.error('Error while fetching dashboard data:', error);
      res.status(500).send('Error fetching data');
  }
});



// app.get('/dashboard-pug', async (req, res) => {
//   try {
//     const users = await User.find(); // Fetch user data from the database

//     const teams = await Team.find(); // Fetch team data from the database

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

const Log = require('./Module/logSchema.js');  // Assume you have a Log model defined elsewhere


async function logMessage(message) {
  const logEntry = new Log({ message });
  await logEntry.save();
}

app.post('/trello-webhook', async (req, res) => {
  try {
    const { action } = req.body;
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    if (action && action.type === 'updateCard' && action.data.listBefore && action.data.listAfter) {
      const cardID = action.data.card.id;
      const cardName = action.data.card.name;
      const fromList = action.data.listBefore.name;
      const toList = action.data.listAfter.name;

      const logMessageText = `Card "${cardName}" moved from ${fromList} to ${toList} at ${timestamp}`;
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