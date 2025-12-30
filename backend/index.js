import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import './config/passport.js';

// Routes
import Conversation from "./models/Conversation.js";
import marketingRoutes from "./routes/marketing.js";
import videoRoutes from "./routes/videoRoutes.js";
import mailRoutes from "./routes/mailRoute.js";
import SocialMediaCalendarRoutes from "./routes/socialMediaCalenderRoutes.js";
import SalesPlanRoutes from "./routes/salesPlanRoutes.js";
import youtubeRouter from "./routes/youtubeRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import paymentRoutes from "./routes/payment.js"

// YouTube OAuth
import { getOAuth2Client, saveToken } from "./services/upload.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// ==========================
// 🔹 GOOGLE AUTH ROUTES
// ==========================

// Start OAuth flow
app.get("/auth/youtube/google", (req, res) => {
  try {
    const oAuth2Client = getOAuth2Client();
    
    // Force consent to get refresh_token
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/youtube.upload"],
      prompt: "consent", // This forces consent screen
      include_granted_scopes: true
    });
    
    console.log("🔐 Redirecting to Google OAuth...");
    console.log("📝 Note: You MUST see the consent screen to get a refresh token");
    res.redirect(authUrl);
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    res.status(500).send(`❌ Error: ${error.message}`);
  }
});

// OAuth callback
app.get("/oauth2callback", async (req, res) => {
  try {
    const code = req.query.code;
    const error = req.query.error;
    
    if (error) {
      console.error("❌ OAuth error:", error);
      return res.status(400).send(`❌ Authorization failed: ${error}`);
    }
    
    if (!code) {
      return res.status(400).send("❌ No authorization code received");
    }

    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    
    console.log("📋 Received tokens:", {
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
      expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : 'none'
    });
    
    if (!tokens.refresh_token) {
      console.warn("⚠️ WARNING: No refresh_token received! This may cause issues.");
      console.warn("⚠️ Try revoking access and re-authorizing:");
      console.warn("⚠️ https://myaccount.google.com/permissions");
    }
    
    // Save token using the service function
    saveToken(tokens);
    
    console.log("✅ YouTube authorization successful!");
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization ${tokens.refresh_token ? 'Successful' : 'Warning'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: ${tokens.refresh_token ? '#28a745' : '#ffc107'}; margin-bottom: 20px; }
            p { color: #666; font-size: 16px; margin: 10px 0; }
            .success-icon { font-size: 60px; margin-bottom: 20px; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
            .warning-text { color: #856404; font-size: 14px; }
            a { color: #667eea; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">${tokens.refresh_token ? '✅' : '⚠️'}</div>
            <h1>YouTube Authorization ${tokens.refresh_token ? 'Complete' : 'Warning'}</h1>
            <p>You can now close this window.</p>
            <p><strong>Token saved to services/token.json</strong></p>
            ${!tokens.refresh_token ? `
              <div class="warning">
                <p class="warning-text"><strong>⚠️ No refresh token received!</strong></p>
                <p class="warning-text">This may cause authentication to fail after 1 hour.</p>
                <p class="warning-text">To fix: <a href="https://myaccount.google.com/permissions" target="_blank">Revoke access</a> and re-authorize.</p>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ OAuth callback error:", err);
    res.status(500).send(`❌ OAuth Failed: ${err.message}`);
  }
});

app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

// ==========================
// 🔹 ROUTES
// ==========================
app.use("/api/marketing", marketingRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/calendar", SocialMediaCalendarRoutes);
app.use("/api/salesPlan", SalesPlanRoutes);
app.use("/api/mail", mailRoutes);
app.use("/youtube", youtubeRouter); // YouTube routes
app.use("/api/payment", paymentRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use('/payment', paymentRoutes);

app.get("/", (req, res) => {
  res.send("Social Media Suite Backend is running!");
});

// ==========================
// 🔹 WHATSAPP WEBHOOK
// ==========================
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const QUESTIONS = [
  "👋 Hi! What's your name?",
  "Nice to meet you! 😊 What's your email address?",
  "Great! What service are you interested in?",
  "Awesome! What's your preferred budget range?",
  "✅ Thanks for sharing! We'll contact you soon 🚀",
];

app.get("/debug-whatsapp", async (req, res) => {
  try {
    const testNumber = "919007977270"; // Your own WhatsApp number for testing
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: testNumber,
        text: { body: "🚀 Debug test from backend!" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      }
    );
    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("❌ WhatsApp debug error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});


// Verify webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive messages
app.post("/webhook", async (req, res) => {
  try {
    const entries = req.body.entry || [];

    for (const entry of entries) {
      for (const change of entry.changes || []) {
        for (const msg of change.value?.messages || []) {
          const from = msg.from;
          const userMsg = msg.text?.body?.trim();
          if (!userMsg) continue;

          let convo = await Conversation.findOne({ userNumber: from });
          if (!convo) {
            convo = await Conversation.create({
              userNumber: from,
              currentStep: 0,
              answers: {},
            });
            await sendReply(from, QUESTIONS[0]);
            continue;
          }

          const step = convo.currentStep;
          convo.answers[QUESTIONS[step]] = userMsg;
          convo.currentStep++;

          await convo.save();

          if (convo.currentStep < QUESTIONS.length) {
            await sendReply(from, QUESTIONS[convo.currentStep]);
          } else {
            await sendReply(from, "🎉 Thanks! You've answered all questions.");
            await Conversation.deleteOne({ userNumber: from });
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

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

// ==========================
// 🔹 DATABASE + SERVER
// ==========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Authorize YouTube at: http://localhost:${PORT}/auth/google`);
});