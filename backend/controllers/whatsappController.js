import axios from "axios";
import Conversation from "../models/Conversation.js";
import { getAnswer } from "../services/kbservice.js";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Verify webhook (GET)
export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

// Receive messages (POST)
export const receiveMessage = async (req, res) => {
  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      for (const change of entry.changes || []) {
        for (const msg of change.value?.messages || []) {
          const from = msg.from;
          const userMsg = msg.text?.body?.trim();
          if (!userMsg) continue;

          // Optionally, track conversation (if needed)
          let convo = await Conversation.findOne({ userNumber: from });
          if (!convo) {
            convo = await Conversation.create({
              userNumber: from,
              answers: {},
            });
          }

          // Get answer from Knowledge Base
          const answer = await getAnswer(userMsg);

          // Save user message in conversation history
          convo.answers[userMsg] = answer;
          await convo.save();

          // Send reply
          await sendReply(from, answer);
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ WhatsApp webhook error:", err);
    res.sendStatus(500);
  }
};

// Send WhatsApp reply
async function sendReply(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
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
  } catch (err) {
    console.error(`❌ Failed to send message to ${to}:`, err.response?.data || err.message);
  }
}
