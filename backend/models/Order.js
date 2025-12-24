import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // The ID sent to Cashfree
  userId: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Link to your Project model
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  
  // Cashfree specific tracking
  paymentSessionId: { type: String }, 
  cfOrderId: { type: String }, // Cashfree's internal order reference
  
  status: { 
    type: String, 
    enum: ["PENDING", "PAID", "FAILED", "CANCELLED"], 
    default: "PENDING" 
  },
  
  paymentMethod: String, // e.g., "UPI", "Card"
  paidAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;