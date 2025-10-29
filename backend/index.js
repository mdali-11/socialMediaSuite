import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// ✅ Step 1: Webhook Verification (Meta -> GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!");
    res.status(200).send(challenge);
  } else {
    console.warn("❌ Webhook verification failed.");
    res.sendStatus(403);
  }
});

// ✅ Step 2: Handle Incoming Messages (Meta -> POST)
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    console.log("📩 Incoming webhook:", JSON.stringify(body, null, 2));

    if (!body.object) return res.sendStatus(404);

    // Some webhooks can include multiple message events in one request
    const entries = body.entry || [];
    const allMessages = [];

    // Collect all messages in the webhook batch
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const messages = change.value?.messages || [];
        for (const msg of messages) {
          allMessages.push({
            from: msg.from,
            body: msg.text?.body || "",
          });
        }
      }
    }

    // Process all messages concurrently
    await Promise.all(
      allMessages.map(async ({ from, body }) => {
        console.log(`💬 Message from ${from}: "${body}"`);

        let replyText = "👋 Hello! This is an auto-reply from my bot.";

        // Example dynamic reply logic
        const msg = body.toLowerCase();
        if (msg.includes("hi") || msg.includes("hello")) {
          replyText = "Hey there 👋 How can I help you today?";
        } else if (msg.includes("price")) {
          replyText = "💰 Our prices start at ₹499. Want details?";
        } else if (msg.includes("thanks")) {
          replyText = "You're welcome! 😊";
        }

        // Send reply
        await sendReply(from, replyText);
      })
    );

    // Always respond quickly to Meta (important)
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.sendStatus(500);
  }
});

// ✅ Function to Send Reply (Independent per request)
async function sendReply(to, text) {
  try {
    const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Reply sent to ${to}: "${text}"`);
  } catch (err) {
    console.error(`❌ Failed to send reply to ${to}:`, err.response?.data || err.message);
  }
}

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
