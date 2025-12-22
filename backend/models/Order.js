// models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  // Who is paying
  userId: {
    type: String,
    required: true
  },

  // Razorpay order id
  orderId: {
    type: String,
    required: true,
    unique: true
  },

  // Amount in paise
  amount: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    default: "INR"
  },

  receipt: {
    type: String
  },

  // Payment status lock
  status: {
    type: String,
    enum: ["CREATED", "PAID", "FAILED"],
    default: "CREATED"
  },

  // Razorpay payment id (after success)
  razorpayPaymentId: {
    type: String
  },

  paidAt: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
