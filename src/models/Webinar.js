import mongoose from "mongoose";

const webinarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    // Optional: track who created the webinar (admin email string, not a User ref)
    createdByEmail: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

webinarSchema.index({ isPublished: 1, date: 1 });

const Webinar = mongoose.model("Webinar", webinarSchema);

export default Webinar;
