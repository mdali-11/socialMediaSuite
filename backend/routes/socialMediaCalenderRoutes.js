import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import SocialMediaCalendar from "../models/SocialMediaCalender.js";

dotenv.config();
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- Helper: Call Gemini API ---
const callGemini = async (prompt, retries = 2) => {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      console.warn("⚠️ Gemini rate limit hit. Retrying in 10 seconds...");
      await new Promise((r) => setTimeout(r, 10000));
      return callGemini(prompt, retries - 1);
    }
    console.error("Gemini API error:", error.response?.data || error.message);
    throw error;
  }
};



// --- POST: Generate Social Media Calendar ---
router.post("/generate", async (req, res) => {
  try {
    const { prompt, timeframe = "yearly", userId, campaignId } = req.body;

    const fullPrompt = `
You are an expert social media strategist AI. Given this prompt: "${prompt}", create a full structured ${timeframe} social media calendar.
For each post, provide strictly JSON fields:
[
  {
    "title": "",
    "date": "YYYY-MM-DD",
    "platform": ["instagram", "facebook"],
    "visuals": [
      {
        "type": "image | video | carousel",
        "specs": [
          { "label": "Aspect Ratio", "value": "1080x1080 or 4:5" },
          { "label": "Quality", "value": "High, Medium, or Low" }
        ],
        "suggestedFormats": ["webp", "mp4", "svg"]
      }
    ],
    "caption": "",
    "hashtags": [],
    "audience": "",
    "status": "draft"
  }
]

Do not include any natural language description outside JSON.
`;

    const data = await callGemini(fullPrompt);
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]";

    const jsonStart = output.indexOf("[");
    const jsonEnd = output.lastIndexOf("]") + 1;
    const jsonText = output.slice(jsonStart, jsonEnd);
    const parsedPosts = JSON.parse(jsonText);

    const newCalendar = await SocialMediaCalendar.create({
      userId,
      campaignId,
      timeframe,
      theme: `${prompt.slice(0, 60)}...`,
      promptUsed: prompt,
      posts: parsedPosts,
    });

    res.status(200).json({ success: true, data: newCalendar });
  } catch (err) {
    console.error("Calendar generation error:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate calendar" });
  }
});



// --- GET: Fetch all calendars for a user ---
router.get("/user/:userId", async (req, res) => {
  try {
    const calendars = await SocialMediaCalendar.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: calendars });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch calendars" });
  }
});



// --- PUT: Update a calendar (add/edit posts manually) ---
router.put("/:calendarId", async (req, res) => {
  try {
    const updated = await SocialMediaCalendar.findByIdAndUpdate(
      req.params.calendarId,
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update calendar" });
  }
});



// --- PUT: Update posts order (drag & drop save) ---
router.put("/:calendarId/reorder", async (req, res) => {
  try {
    const { reorderedPosts } = req.body;
    const calendar = await SocialMediaCalendar.findById(req.params.calendarId);
    if (!calendar) return res.status(404).json({ success: false, error: "Calendar not found" });

    calendar.posts = reorderedPosts;
    await calendar.save();

    res.status(200).json({ success: true, data: calendar });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to reorder posts" });
  }
});



// --- DELETE: Remove a specific post ---
router.delete("/:calendarId/post/:postId", async (req, res) => {
  try {
    const { calendarId, postId } = req.params;
    const calendar = await SocialMediaCalendar.findById(calendarId);
    if (!calendar) return res.status(404).json({ success: false, error: "Calendar not found" });

    calendar.posts = calendar.posts.filter(p => p._id.toString() !== postId);
    await calendar.save();

    res.status(200).json({ success: true, data: calendar });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete post" });
  }
});

export default router;
