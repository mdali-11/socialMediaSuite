import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  // For social login
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  
  profilePhoto: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isActive: { type: Boolean, default: true },
  
  password: { type: String }, // optional if using local login
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const User = mongoose.model("User", UserSchema);
export default User;
