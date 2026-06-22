import mongoose from "mongoose";
import { REMINDER_KEYS } from "../config/reminderWindows.js";

const registrationSchema = new mongoose.Schema(
  {
    webinar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
      required: true,
    },
    // Convenience alias — same value as webinar, kept for legacy compatibility
    webinarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "failed"],
      default: "pending",
    },
    remindersSent: {
      type: [String],
      enum: REMINDER_KEYS,
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent duplicate registration for the same webinar + email
registrationSchema.index({ webinar: 1, email: 1 }, { unique: true });
// Useful for admin search and cron queries
registrationSchema.index({ paymentStatus: 1 });
registrationSchema.index({ createdAt: -1 });

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;