// import express from "express";
// import axios from "axios";
// import MarketingCampaign from "../models/MarketingCampaign.js";
// import dotenv from "dotenv";
// dotenv.config();

// const router = express.Router();

// const callOpenAI = async (payload, retries = 3) => {
//   try {
//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     if (error.response?.status === 429 && retries > 0) {
//       console.warn("⚠️ Rate limit hit. Retrying in 10 seconds...");
//       await new Promise((r) => setTimeout(r, 10000));
//       return callOpenAI(payload, retries - 1);
//     } else {
//       throw error;
//     }
//   }
// };

// // POST /api/marketing/generate
// router.post("/generate", async (req, res) => {
//   try {
//     const { prompt, timeframe = "monthly", channels = ["google_ads", "instagram", "facebook"], userId } = req.body;

//     const fullPrompt = `
// You are a professional marketing strategist AI. Given this prompt: "${prompt}", create a structured marketing plan including:
// 1. Campaign name & objective
// 2. Google Ads (headlines, descriptions, keywords, budget)
// 3. Instagram Reel ideas (title, script, hashtags)
// 4. Hashtags (primary, secondary, niche)
// 5. Social media posts (12 posts for monthly or 52 for yearly calendar)
// 6. KPIs (expected CTR, CVR, engagement)
// Return valid JSON only.
// `;

//     const payload = {
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: fullPrompt }],
//       response_format: { type: "json_object" },
//       temperature: 0.7,
//     };

//     const response = await callOpenAI(payload);
//     const output = response.choices[0].message.content;
//     const parsed = JSON.parse(output);

//     const newCampaign = await MarketingCampaign.create({
//       userId,
//       prompt,
//       campaignName: parsed.campaign_name,
//       objective: parsed.objective,
//       timeframe,
//       channels,
//       generated: parsed,
//     });

//     res.status(200).json({ success: true, data: newCampaign });
//   } catch (err) {
//     console.error("MarketingGPT error:", err.response?.data || err.message);
//     res.status(500).json({ success: false, error: "Failed to generate campaign" });
//   }
// });

// export default router;


import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import MarketingCampaign from "../models/MarketingCampaign.js";

dotenv.config();
const router = express.Router();

/**
 * Google Gemini (Free) endpoint:
 * https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent
 *
 * You must create your API key at:
 * 👉 https://makersuite.google.com/app/apikey
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const callGemini = async (prompt, retries = 2) => {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
    } else {
      console.error("Gemini API error:", error.response?.data || error.message);
      throw error;
    }
  }
};


router.post("/generate", async (req, res) => {
  try {
    const {
      prompt,
      timeframe = "monthly",
      channels = ["google_ads", "instagram", "facebook"],
      userId,
    } = req.body;

    const fullPrompt = `
You are a professional marketing strategist AI. Given this prompt: "${prompt}", create a structured marketing plan including:
1. Campaign name & objective
2. Google Ads (headlines, descriptions, keywords, budget)
3. Instagram Reel ideas (title, script, hashtags)
4. Hashtags (primary, secondary, niche)
5. Social media posts (12 posts for monthly or 52 for yearly calendar)
6. KPIs (expected CTR, CVR, engagement)
Return the result strictly in JSON format, with keys:
{
  "campaign_name": "",
  "objective": "",
  "google_ads": [],
  "instagram_reels": [],
  "hashtags": { "primary": [], "secondary": [], "niche": [] },
  "social_posts": [],
  "kpis": {}
}.
`;

    const data = await callGemini(fullPrompt);

    // Gemini returns nested text
    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

    // Clean & parse JSON safely
    const jsonStart = output.indexOf("{");
    const jsonEnd = output.lastIndexOf("}") + 1;
    const jsonText = output.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonText);

    const newCampaign = await MarketingCampaign.create({
      userId,
      prompt,
      campaignName: parsed.campaign_name,
      objective: parsed.objective,
      timeframe,
      channels,
      generated: parsed,
    });

    res.status(200).json({ success: true, data: newCampaign });
  } catch (err) {
    console.error("MarketingGemini error:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate campaign" });
  }
});

export default router;

