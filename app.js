// Importing required packages and modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/user');
const helmet = require('helmet');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const app = express();

// Retrieving MongoDB URI from environment variables
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

// Creating a new MongoDB session store for Express sessions
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
// Setting the view engine and views directory for EJS templates
app.set('view engine', 'ejs');
app.set('views', 'views');

// Setting up the required middleware and configurations
app.use(express.urlencoded({ extended:false}));
app.use(express.static(path.join(__dirname, 'public')));


// Serve static files for the /admin section
app.use('/admin', express.static('public'));

// Configuring Express to use session for user authentication
app.use(
    session({
        secret:'my secret', // Secret used to sign the session ID cookie
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// Custom middleware to check if a user is logged in and attach the user data to the request
app.use((req,res,next)=>{
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user; // Attaching user data to the request object
        next();
    })
    .catch(err => console.log(err));
})

// Importing and using route handlers for authentication, shop, and admin
app.use(authRoutes);
app.use(shopRoutes);
app.use('/admin',adminRoutes);
// Using the helmet middleware for added security
app.use(helmet());



// Connecting to the MongoDB database and starting the Express server
mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('connect to database');
    app.listen(3000);
})
.catch((err) => {
    console.log(err);
})

