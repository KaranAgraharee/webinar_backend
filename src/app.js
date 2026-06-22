import express from "express";
import cors from "cors";
import webinarRoutes from "./routes/webinarRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { config } from "dotenv";

config();

const app = express();

const urls =  [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
      process.env.DEV_URL,
    ]

app.use(
  cors({
    origin:urls,
    credentials: true,
  })
);
console.log(process.env.CLIENT_URL)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

app.use("/api/webinars", webinarRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", registrationRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
