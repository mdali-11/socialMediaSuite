import express from "express";
import { verifyWebhook, webhook } from "../controlllers/whatsappController.js";

const router = express.Router();

// For Meta verification (GET)
router.get("/webhook", verifyWebhook);

// For receiving messages (POST)
router.post("/webhook", webhook);

export default router;
