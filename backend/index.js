import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // 🔑 use your custom verify token

// ✅ Step 1: Verification endpoint (Meta sends GET request)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified ✅");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Step 2: Handle incoming messages (Meta sends POST request)
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Webhook received:", JSON.stringify(body, null, 2));

  if (body.object) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message && message.text) {
      const from = message.from; // WhatsApp number of sender
      const msgBody = message.text.body;

      console.log(`Got message: "${msgBody}" from ${from}`);

      // Auto-reply
      await sendReply(from, "Hello! 👋 This is an auto-reply from my bot.");
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

async function sendReply(to, text) {
  const phoneNumberId = process.env.PHONE_NUMBER_ID; // from Meta
  const accessToken = process.env.ACCESS_TOKEN; // from Meta

  await axios.post(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  console.log("✅ Auto reply sent");
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
