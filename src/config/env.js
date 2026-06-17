import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGODB_URI",
  "CLERK_SECRET_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set in environment variables`);
  }
}

if (!process.env.CLERK_SECRET_KEY) {
  console.error(
    "\n[Clerk] CLERK_SECRET_KEY is missing in server/.env.\n" +
      "Copy the Secret Key from https://dashboard.clerk.com → your app (sound-oriole-95) → API Keys.\n" +
      "It must match the same Clerk app as client VITE_CLERK_PUBLISHABLE_KEY.\n"
  );
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI,
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  },
  // Primary client URL (kept for backward-compatibility).
  clientUrl: process.env.CLIENT_URL || "https://webinar.khushnay.com",
  // Allow a comma-separated list of allowed client origins (useful for localhost and deployed URL).
  clientAllowedOrigins: (process.env.CLIENT_URLS || process.env.CLIENT_URL || "https://webinar.khushnay.com")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean),
  adminClerkUserIds: (process.env.ADMIN_CLERK_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
};
