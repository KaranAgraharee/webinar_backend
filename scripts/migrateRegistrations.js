import mongoose from "mongoose";
import dotenv from "dotenv";
import { clerkClient } from "@clerk/express";
import Registration from "../src/models/Registration.js";
import User from "../src/models/User.js";

dotenv.config();

const migrate = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is required");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Find registrations that are missing any of the new fields
  const registrations = await Registration.find({
    $or: [
      { name: { $exists: false } },
      { email: { $exists: false } },
      { phone: { $exists: false } },
      { webinarId: { $exists: false } },
      { name: "" },
      { email: "" },
    ],
  });

  console.log(`Found ${registrations.length} registrations to migrate.`);

  let updatedCount = 0;
  let errorCount = 0;

  for (const registration of registrations) {
    try {
      console.log(`\nProcessing registration ${registration._id} (clerkUserId: ${registration.clerkUserId})...`);

      let user = await User.findOne({ clerkUserId: registration.clerkUserId });

      let email = registration.email || user?.email;
      let name = registration.name || user?.name;
      let phone = registration.phone || user?.phone;

      // If we are missing any key attendee details, fetch from Clerk API
      if (!email || !name || !phone) {
        try {
          console.log(`Fetching user details from Clerk for ID: ${registration.clerkUserId}...`);
          const clerkUser = await clerkClient.users.getUser(registration.clerkUserId);
          
          const clerkEmail = clerkUser.emailAddresses.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
          )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "";

          const clerkPhone = clerkUser.phoneNumbers.find(
            (p) => p.id === clerkUser.primaryPhoneNumberId
          )?.phoneNumber || clerkUser.phoneNumbers[0]?.phoneNumber || "";

          const clerkName = [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || clerkEmail.split("@")[0] || "";

          email = email || clerkEmail;
          phone = phone || clerkPhone;
          name = name || clerkName;

          // Also update user document in MongoDB if we found new details
          if (user) {
            let userUpdated = false;
            if (!user.email && clerkEmail) { user.email = clerkEmail; userUpdated = true; }
            if (!user.name && clerkName) { user.name = clerkName; userUpdated = true; }
            if (!user.phone && clerkPhone) { user.phone = clerkPhone; userUpdated = true; }
            if (userUpdated) {
              await user.save();
              console.log("Updated local User document with Clerk details.");
            }
          } else {
            user = await User.create({
              clerkUserId: registration.clerkUserId,
              email: clerkEmail,
              name: clerkName,
              phone: clerkPhone,
            });
            console.log("Created local User document with Clerk details.");
          }
        } catch (clerkErr) {
          console.warn(`Could not fetch details from Clerk: ${clerkErr.message}`);
        }
      }

      // Populate registration details
      registration.name = name || registration.name || "Unknown";
      registration.email = email || registration.email || `${registration.clerkUserId}@clerk.local`;
      registration.phone = phone || registration.phone || "";
      if (!registration.webinarId) {
        registration.webinarId = registration.webinar;
      }

      await registration.save();
      console.log(`Successfully migrated registration ${registration._id}.`);
      updatedCount++;
    } catch (err) {
      console.error(`Error migrating registration ${registration._id}:`, err);
      errorCount++;
    }
  }

  console.log(`\nMigration Summary:`);
  console.log(`- Total processed: ${registrations.length}`);
  console.log(`- Successfully updated: ${updatedCount}`);
  console.log(`- Errors encountered: ${errorCount}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
};

migrate().catch((error) => {
  console.error("Migration script failed:", error);
  process.exit(1);
});
