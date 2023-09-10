const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the order schema using Mongoose Schema
const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true }, // The product information (e.g., title, price, description)
      quantity: { type: Number, required: true }, // The quantity of the product in the order
    },
  ],
  user: {
    // Information about the user who placed the order
    name: {
      type: String,
      required: true, // The user's name is required for an order
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User", // The user ID references the 'User' model (relationship with User model)
    },
  },
});

// Create and export the 'Order' model based on the defined schema
module.exports = mongoose.model("Order", orderSchema);
