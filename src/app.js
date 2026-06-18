import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import webinarRoutes from "./routes/webinarRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import attendeeRoutes from "./routes/attendees.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { env } from "./config/env.js";

const app = express();

// Configure CORS to allow only configured origins
const allowedOrigins = env.clientAllowedOrigins || [env.clientUrl];
app.use(cors({
  origin: [
    "https://webinar.khushnay.com",
    "https://khushnay-webinar.vercel.app",
    "http://localhost:5173",
    "https://karanagraharee.github.io/"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

app.use("/attendees", attendeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/webinars", webinarRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", registrationRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
