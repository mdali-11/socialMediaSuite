import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import SalesPlan from "../models/SalesPlan.js";

dotenv.config();
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const callGemini = async (prompt, retries = 2) => {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
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
    const { businessName, businessType, currentStage, painPoints, goals, timeframe, userId } = req.body;

    const fullPrompt = `
You are a master sales strategist. Given the following details:
- Business Name: ${businessName}
- Type: ${businessType}
- Current Stage: ${currentStage} (new, growing, stagnant, revamping)
- Pain Points: ${painPoints.join(", ")}
- Goals: ${goals.join(", ")}
- Timeframe: ${timeframe}

Create a detailed SALES GROWTH PLAN including:
1. Overview Objective
2. Online and Offline Sales Strategies
3. Funnel stages (Awareness, Engagement, Conversion, Retention)
4. Tasks under each stage with actionable steps
5. KPIs to track success
6. Progress defaults — all tasks should start with status "ready to start".

Return response strictly as JSON:
{
  "objective": "",
  "strategies": [
    {
      "type": "online/offline",
      "objective": "",
      "description": "",
      "channels": [],
      "budget": 0,
      "kpis": [],
      "funnel": [
        {
          "stageName": "",
          "goal": "",
          "tasks": [
            { "title": "", "description": "", "status": "ready to start" }
          ]
        }
      ]
    }
  ]
}
`;

    const data = await callGemini(fullPrompt);

    const output = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const jsonStart = output.indexOf("{");
    const jsonEnd = output.lastIndexOf("}") + 1;
    const jsonText = output.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonText);

    const newPlan = await SalesPlan.create({
      userId,
      businessName,
      businessType,
      currentStage,
      painPoints,
      goals,
      timeframe,
      strategies: parsed.strategies,
      generatedResponse: parsed,
    });

    res.status(200).json({ success: true, data: newPlan });
  } catch (err) {
    console.error("SalesPlan error:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate sales plan" });
  }
});

export default router;
