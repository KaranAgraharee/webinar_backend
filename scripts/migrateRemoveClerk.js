/**
 * Migration: Remove Clerk from existing MongoDB documents
 *
 * What this does:
 * 1. Strips clerkUserId and user fields from Registration documents
 * 2. Ensures all Registration docs have the new required fields (name/email/phone)
 *    using whatever data is already stored inline.
 * 3. Safe to re-run (idempotent)
 *
 * Run: node scripts/migrateRemoveClerk.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in .env");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log("Connected to MongoDB");

const db = mongoose.connection.db;

// ─── 1. Strip Clerk fields from Registration ──────────────────────────────────

console.log("\n[1] Stripping clerkUserId and user fields from Registration...");

const regResult = await db.collection("registrations").updateMany(
  {},
  {
    $unset: { clerkUserId: "", user: "" },
  }
);

console.log(
  `    Modified ${regResult.modifiedCount} Registration documents`
);

// ─── 2. Set placeholder name/email/phone on docs missing them ─────────────────

console.log("\n[2] Filling missing name/email/phone placeholders...");

const missingEmail = await db.collection("registrations").updateMany(
  { email: { $in: [null, "", undefined] } },
  {
    $set: {
      email: "unknown@migration.local",
      name: "Unknown",
      phone: "0000000000",
    },
  }
);

console.log(
  `    Patched ${missingEmail.modifiedCount} Registration docs with missing contact info`
);

// ─── 3. Strip user ref from Payment documents ─────────────────────────────────

console.log("\n[3] Stripping user field from Payment documents...");

const payResult = await db.collection("payments").updateMany(
  {},
  { $unset: { user: "" } }
);

console.log(`    Modified ${payResult.modifiedCount} Payment documents`);

// ─── 4. Strip createdBy from Webinar documents ────────────────────────────────

console.log("\n[4] Stripping createdBy from Webinar documents...");

const webResult = await db.collection("webinars").updateMany(
  {},
  { $unset: { createdBy: "" } }
);

console.log(`    Modified ${webResult.modifiedCount} Webinar documents`);

// ─── Done ─────────────────────────────────────────────────────────────────────

console.log("\n✅ Migration complete. You can now drop the 'users' collection if no longer needed.");
console.log("   To drop: db.users.drop() in MongoDB shell\n");

await mongoose.disconnect();
