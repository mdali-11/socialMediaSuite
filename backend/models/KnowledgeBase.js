import mongoose from "mongoose";

const knowledgeBaseSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  answer: { type: String, required: true },
  tags: { type: [String], default: [] }, // Optional for categorization/search
});

const KnowledgeBase = mongoose.model("KnowledgeBase", knowledgeBaseSchema);

export default KnowledgeBase;
