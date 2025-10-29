import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Conversation from "./models/Conversation.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// 🔹 Define your question sequence
const QUESTIONS = [
  "👋 Hi! What’s your name?",
  "Nice to meet you! 😊 What’s your email address?",
  "Great! What service are you interested in?",
  "Awesome! What’s your preferred budget range?",
  "✅ Thanks for sharing! We’ll contact you soon 🚀"
];

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

    if (!body.object) return res.sendStatus(404);

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const messages = change.value?.messages || [];
        for (const msg of messages) {
          const from = msg.from;
          const userMsg = msg.text?.body?.trim() || "";

          if (!userMsg) continue;

          console.log(`💬 Message from ${from}: "${userMsg}"`);

          // Find or create conversation
          let convo = await Conversation.findOne({ userNumber: from });
          if (!convo) {
            convo = await Conversation.create({ userNumber: from, currentStep: 0 });
            await sendReply(from, QUESTIONS[0]);
            continue;
          }

          const step = convo.currentStep;
          const nextStep = step + 1;

          // Save user’s reply
          convo.answers[`step_${step}`] = userMsg;
          convo.currentStep = nextStep;
          await convo.save();

          // If more questions are left, ask next
          if (nextStep < QUESTIONS.length) {
            await sendReply(from, QUESTIONS[nextStep]);
          } else {
            // Conversation complete
            await sendReply(from, "🎉 Thanks! You’ve answered all questions.");
            console.log("📦 Final user data:", convo.answers);

            // Optionally store / process / send to CRM etc.
            await Conversation.deleteOne({ userNumber: from }); // clear user state
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.sendStatus(500);
  }
});

// ✅ Function to send replies
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
    console.log(`✅ Sent to ${to}: "${text}"`);
  } catch (err) {
    console.error(`❌ Send failed to ${to}:`, err.response?.data || err.message);
  }
}

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
