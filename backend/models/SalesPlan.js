// models/SalesPlan.js
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedTo: String,
  dueDate: Date,
  status: {
    type: String,
    enum: ["ready to start", "in progress", "implemented", "completed"],
    default: "ready to start",
  },
});

const FunnelStageSchema = new mongoose.Schema({
  stageName: String, // e.g. Awareness, Interest, Conversion
  goal: String,
  tasks: [TaskSchema],
});

const StrategySchema = new mongoose.Schema({
  type: { type: String, enum: ["online", "offline"] },
  objective: String,
  description: String,
  channels: [String],
  budget: Number,
  kpis: [String],
  funnel: [FunnelStageSchema],
});

const SalesPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  businessName: String,
  businessType: String,
  currentStage: {
    type: String,
    enum: ["new", "growing", "stagnant", "revamping"],
    default: "new",
  },
  painPoints: [String],
  goals: [String],
  timeframe: { type: String, default: "1 month" },
  strategies: [StrategySchema],
  progress: {
    completed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ["not started", "in progress", "ready to start", "implemented", "completed"],
    default: "ready to start",
  },
  generatedResponse: mongoose.Schema.Types.Mixed,
});




const SalesPlan = mongoose.model("SalesPlan", SalesPlanSchema);

export default SalesPlan;
