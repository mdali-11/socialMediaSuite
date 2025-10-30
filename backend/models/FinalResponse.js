import mongoose from "mongoose";

const FinalResponseSchema = new mongoose.Schema({
  userNumber: String,
  answers: Object,
  createdAt: Date
});

const FinalResponse = mongoose.model("FinalResponse", FinalResponseSchema);

export default FinalResponse;
