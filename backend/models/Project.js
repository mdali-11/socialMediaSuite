// models/Project.js
import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  industry: String,
  productOrService: String,
  targetAudience: String,
  currentMonthlyRevenue: String,
  growthGoal: String,
  budget: String,
  location: String,
  businessStage: {
    type: String,
    enum: ["launch", "growth", "stagnant", "scale", "unicorn"],
    default: "launch"
  },
  painPoints: String,
  teamSize: String,
  existingMarketingChannels: String,
  timeframe: String,
  uniqueSellingPoint: String,
  competitors: String,
  expectedOutcome: String,
  overallStatus: { type: String, default: "start implementation" },
  overallProgress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});


const Project = mongoose.model("Project", ProjectSchema);

export default Project;
