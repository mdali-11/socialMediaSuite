import mongoose from "mongoose";

const visualSpecSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video", "carousel"],
    required: true,
  },
  specs: [
    {
      label: String,      // e.g. "Aspect Ratio"
      value: String,      // e.g. "1080x1350 (4:5)"
    },
  ],
  suggestedFormats: [String], // e.g. ["webp", "mp4", "svg"]
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "New Year Campaign Post"
  date: { type: Date, required: true },    // exact publishing date
  platform: {
    type: [String],
    enum: ["instagram", "facebook", "linkedin", "twitter", "youtube"],
    default: ["instagram"],
  },
  visuals: [visualSpecSchema],
  caption: { type: String },
  hashtags: [String],
  audience: { type: String }, // e.g. "Young professionals", "Fitness enthusiasts"
  status: {
    type: String,
    enum: ["draft", "scheduled", "published"],
    default: "draft",
  },
  orderIndex: { type: Number, default: 0 }, // for drag-drop reordering
});

const socialMediaCalendarSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "MarketingCampaign" },
    timeframe: { type: String, enum: ["monthly", "yearly"], default: "yearly" },
    theme: { type: String }, // e.g. “Brand Awareness 2025”
    promptUsed: { type: String }, // the AI prompt used to generate
    posts: [postSchema],
  },
  { timestamps: true }
);

const SocialMediaCalendar = mongoose.model("SocialMediaCalendar", socialMediaCalendarSchema);

export default SocialMediaCalendar;

