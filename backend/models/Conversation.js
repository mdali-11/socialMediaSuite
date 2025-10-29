import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  userNumber: { type: String, required: true, unique: true },
  currentStep: { type: Number, default: 0 },
  answers: { type: Object, default: {} },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
