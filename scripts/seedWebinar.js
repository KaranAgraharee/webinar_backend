import mongoose from "mongoose";
import dotenv from "dotenv";
import Webinar from "../src/models/Webinar.js";
import User from "../src/models/User.js";

dotenv.config();

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  let creator = await User.findOne({ role: "admin" });

  if (!creator) {
    creator = await User.create({
      clerkUserId: "seed_admin_user",
      name: "Seed Admin",
      email: "admin@example.com",
      role: "admin",
    });
  }

  const existing = await Webinar.findOne({ title: "Heal. Grow. Transform." });

  if (existing) {
    existing.isPublished = true;
    await existing.save();
    console.log("Updated existing webinar:", existing._id.toString());
  } else {
    const webinar = await Webinar.create({
      title: "Heal. Grow. Transform.",
      description:
        "Break free from toxic relationship patterns and rebuild self-worth in this live 90-minute healing webinar.",
      date: new Date("2026-06-20T00:00:00.000Z"),
      time: "11:30 AM",
      venue: "Live Online Webinar",
      meetingLink: "",
      price: 499,
      isPublished: true,
      createdBy: creator._id,
    });
    console.log("Created webinar:", webinar._id.toString());
  }

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
