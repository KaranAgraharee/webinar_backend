import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Both endpoints are now public — identity comes from request body (name/email/phone)
router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);

export default router;