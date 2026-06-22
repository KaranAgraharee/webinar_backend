import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGODB_URI",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set in environment variables`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || "changeme_insecure_default",
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    passwordHash: process.env.ADMIN_PASSWORD_HASH || "",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173/",
  clientAllowedOrigins: (
    process.env.CLIENT_URLS ||
    process.env.CLIENT_URL ||
    "https://webinar.khushnay.com"
  )
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean),
};
