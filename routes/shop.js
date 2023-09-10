// Importing necessary modules
const path = require('path');
const express = require('express');

// Importing the controller module for the shop
const shopController = require('../controllers/shop');
// Importing the isAuth middleware to protect routes that require authentication
const isAuth = require('../middlewares/is-auth');
// Creating a new router instance
const router = express.Router();

// Route to render the index (home) page (GET /)
router.get('/', shopController.getIndex);

// Route to render the products page (GET /products)
router.get('/products', shopController.getProducts);

// Route to render a specific product's details page (GET /products/:productId)
router.get('/products/:productId', shopController.getProduct);

// Route to render the cart page (GET /cart)
router.get('/cart', isAuth, shopController.getCart);

// Route to handle adding a product to the cart (POST /add-to-cart)
router.post('/add-to-cart', isAuth, shopController.postCart);

// Route to handle deleting a product from the cart (POST /cart-delete-item)
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

// Route to handle creating an order (POST /create-order)
router.post('/create-order', isAuth, shopController.postOrder);

// Route to render the user's orders page (GET /orders)
router.get('/orders', isAuth, shopController.getOrders);

// Route to render the checkout page (GET /checkout)
router.get('/checkout', isAuth, shopController.getCheckout );

// Route to handle the successful order submission (GET /checkout/success)
router.get('/checkout/success', isAuth, shopController.postOrder);

// Route to handle the canceled order submission (GET /checkout/cancel)
router.get('/checkout/cancel' , isAuth, shopController.getCheckout);

// Exporting the router instance to be used in the main application
module.exports = router;

