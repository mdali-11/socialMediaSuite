import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema(
  {
    phoneNumberId: { type: String, required: true },
    verifyToken: { type: String, required: true },
    permanentAccessToken: { type: String, required: true },
    businessAccountId: { type: String },
    appId: { type: String },
    autoReplyEnabled: { type: Boolean, default: true },
    autoReplyText: { type: String, default: 'Thanks for your message!' },
  },
  { timestamps: true }
);

// Only single config doc used for now
ConfigSchema.index({ phoneNumberId: 1 }, { unique: true });

export const Config = mongoose.model('Config', ConfigSchema);


