// Import required packages and modules
const mongoose = require("mongoose");

// Get a reference to the Mongoose Schema constructor
const Schema = mongoose.Schema;

// Define the product schema using Mongoose Schema
const productSchema = new Schema({
  // Product title field
  title: {
    type: String,
    required: true,
  },
  // Product price field
  price: {
    type: Number,
    required: true,
  },
  // Product price field
  description: {
    type: String,
    required: true,
  },
  // Product image URL field
  imageUrl: {
    type: String,
    required: true,
  },
  // Product category field
  category: {
    type: String,
    required: true,
  },
  // User ID field to associate the product with the user who created it
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Create and export the 'Product' model based on the defined schema
module.exports = mongoose.model("Product", productSchema);
