import mongoose from "mongoose";
import { REMINDER_KEYS } from "../config/reminderWindows.js";

const registrationSchema = new mongoose.Schema(
  {
    webinar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clerkUserId: {
      type: String,
      required: true,
      index: true,
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    remindersSent: {
      type: [String],
      enum: REMINDER_KEYS,
      default: [],
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    webinarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
    },
  },
  { timestamps: true }
);

registrationSchema.index({ webinar: 1, user: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
