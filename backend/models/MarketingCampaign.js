// models/MarketingCampaign.js
import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userId: String,
  prompt: String,
  campaignName: String,
  objective: String,
  timeframe: String, // "monthly" or "yearly"
  channels: [String],
  generated: Object, // All LLM output
  createdAt: { type: Date, default: Date.now },
});


const MarketingCampaign = mongoose.model("MarketingCampaign", CampaignSchema);

export default MarketingCampaign;

