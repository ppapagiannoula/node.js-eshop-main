// Importing necessary modules
const express = require('express');

// Importing the controller module for authentication
const authController = require('../controllers/auth');

// Creating a new router instance
const router = express.Router();

// Route to render the login page (GET /login)
router.get('/login', authController.getLogin);

// Route to handle the login form submission (POST /login)
router.post('/login', authController.postLogin);

// Route to handle the signup form submission (POST /signup)
router.post('/signup', authController.postSignup);

// Route to render the signup page (GET /signup)
router.get('/signup', authController.getSignup);

// Route to handle the user logout functionality (POST /logout)
router.post('/logout', authController.postLogout);

// Route to render the password reset page (GET /reset)
router.get('/reset', authController.getReset);

// Route to handle the password reset form submission (POST /reset)
router.post('/reset', authController.postReset);

// Exporting the router instance to be used in the main application
module.exports = router;