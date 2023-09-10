// Importing the required modules and files
const path = require('path');
const express = require('express');

// Importing the admin controller to handle admin-related actions
const adminController = require('../controllers/admin');
// Importing the isAuth middleware for authentication
const isAuth = require ('../middlewares/is-auth');
// Creating an instance of the Express Router
const router = express.Router();

// Route for displaying the "Add Product" page
router.get('/addProduct', isAuth, adminController.getAddProduct);

// Route for displaying the "Products" page
router.get('/products', isAuth, adminController.getProducts);

// Route for adding a new product (submitting the product form)
router.post('/addProduct', isAuth, adminController.postAddProduct);

// Route for displaying the "Edit Product" page for a specific product
router.get('/edit-product:productId', isAuth, adminController.getEditProduct);

// Route for updating the details of an existing product
router.post('/edit-product', isAuth, adminController.postEditProduct);

// Route for deleting a product
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

// Exporting the router to be used in the main application
module.exports = router;
