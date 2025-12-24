import express from "express";
import axios from "axios";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Cashfree base URL based on environment
const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === "TEST"
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";

router.post("/initiate-test-payment", async (req, res) => {
    try {
        const { cartId, userId } = req.body;
        const uniqueOrderId = `ORD_${Date.now()}`;

        // Validate credentials
        if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
            return res.status(500).json({
                error: "Cashfree credentials missing in environment variables"
            });
        }

        const request = {
            order_amount: 1.00,
            order_currency: "INR",
            order_id: uniqueOrderId,
            customer_details: {
                customer_id: userId || "USER_123",
                customer_phone: "9007977270",
                customer_name: "Md Ali",
                customer_email: "test@example.com"
            },
            order_meta: {
                return_url: `http://localhost:3000/payment-verify?order_id=${uniqueOrderId}`
            }
        };

        console.log("Creating order with Cashfree...");
        console.log("Request:", JSON.stringify(request, null, 2));

        // Direct API call to Cashfree
        const response = await axios.post(
            `${CASHFREE_BASE_URL}/orders`,
            request,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-version": "2025-01-01",
                    "x-client-id": process.env.CASHFREE_CLIENT_ID,
                    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET
                }
            }
        );

        console.log("Cashfree response:", response.data);

        const newOrder = new Order({
            orderId: uniqueOrderId,
            userId: userId || "USER_123",
            cartId: cartId,
            amount: 1.00,
            paymentSessionId: response.data.payment_session_id,
            status: "PENDING"
        });

        await newOrder.save();

        res.json({
            payment_session_id: response.data.payment_session_id,
            order_id: uniqueOrderId
        });

    } catch (error) {
        console.error("Cashfree API Failure:", error.message);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        
        res.status(error.response?.status || 500).json({
            error: "Payment initialization failed",
            details: error.response?.data || error.message
        });
    }
});

export default router;