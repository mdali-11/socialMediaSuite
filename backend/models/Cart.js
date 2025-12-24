import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      serviceName: String, // e.g., "Growth Strategy Session"
      price: Number,
      quantity: { type: Number, default: 1 },
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" } // Optional: link to the project
    }
  ],
  totalAmount: { type: Number, required: true, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;