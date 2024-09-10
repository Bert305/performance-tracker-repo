const express = require('express');//back-end web-framework
const colors =require('colors')
const dotenv = require('dotenv').config()//allows to use dotenv
const connectDB = require('./config/connectDB.js')
const port = process.env.PORT || 5000 
const app = express() //creates an instance of express

const cors = require("cors");//added recently to help the backend connect to the front-end
const teamRoutes= require('./routes/teamRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
// const pug = require('pug');//added recently to help with rendering
// const path = require('path');





// Set Pug as the template engine
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// app.get('/sample', (req, res) => {
//     res.render('sample',
//         {title : 'Express Pug ', message: 'Pug is a template engine for Express'}
//     )
//   })




connectDB()//connects our Atlas cluster

app.use(cors());//needed to execute cors
const bodyParser = require('body-parser'); 
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