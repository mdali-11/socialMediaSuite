import express from "express";
import { verifyWebhook, receiveMessage } from "../controllers/whatsappController.js";

const router = express.Router();

router.get("/webhook", verifyWebhook);   // Verification endpoint
router.post("/webhook", receiveMessage); // Receive messages

export default router;
