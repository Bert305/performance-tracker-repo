const express = require('express');//back-end web-framework
const colors =require('colors')
const dotenv = require('dotenv').config()//allows to use dotenv
const connectDB = require('./config/connectDB.js')
const port = process.env.PORT || 5000 
const app = express() //creates an instance of express

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



//port listener
app.listen(port,()=>{
    console.log(`Our server port ${port} is running!!!!`)
})