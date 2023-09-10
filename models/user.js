// Import required packages and modules
const mongoose = require("mongoose");

// Get a reference to the Mongoose Schema constructor
const Schema = mongoose.Schema;

// Define the user schema using Mongoose Schema
const userSchema = new Schema({
  // User name field
  name: {
    type: String,
    required: true,
  },
  // User email field
  email: {
    type: String,
    required: true,
  },
  // User password field
  password: {
    type: String,
    required: true,
  },
  // Fields for password reset feature
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

// Method to add a product to the user's cart
userSchema.methods.addToCart = function (product) {
  // Check if the product already exists in the cart
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  // Initialize quantity to 1 and create a copy of the cart items array
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  // If the product is already in the cart, update its quantity
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  // Update the user's cart and save the changes to the database
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

// Method to remove a product from the user's cart
userSchema.methods.removeFromCart = function (productId) {
  // Filter out the item with the specified product ID from the cart
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  // Update the user's cart and save the changes to the database
  this.cart.items = updatedCartItems;
  return this.save();
};

// Method to clear the user's cart (remove all items)
userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

// Create and export the 'User' model based on the defined schema
module.exports = mongoose.model("User", userSchema);
