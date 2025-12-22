// import express from "express";
// import {
//   createOrder,
//   verifyPayment
// } from "../controllers/payment.controller.js";

// const router = express.Router();

// router.post("/create-order", createOrder);
// router.post("/verify", verifyPayment);

// export default router;

import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ------------------------------
// Create Order
// ------------------------------
router.post("/create-order", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // 1️⃣ Check if unpaid order exists
    const existingOrder = await Order.findOne({
      userId,
      status: "CREATED"
    });

    if (existingOrder) {
      return res.json(existingOrder);
    }

    // 2️⃣ Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // INR to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    // 3️⃣ Save order in DB
    const order = await Order.create({
      userId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// Verify Payment
// ------------------------------
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // 1️⃣ Fetch order
    const order = await Order.findOne({ orderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Already paid? Stop
    if (order.status === "PAID") {
      return res.json({ message: "Payment already processed" });
    }

    // 3️⃣ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 4️⃣ Mark order as PAID
    order.status = "PAID";
    order.razorpayPaymentId = razorpay_payment_id;
    order.paidAt = new Date();

    await order.save();

    res.json({ message: "Payment verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
