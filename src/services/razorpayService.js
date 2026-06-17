import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const razorpay = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});
export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  console.log("hit it")
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    console.log(razorpay)
    throw new AppError("Payment gateway is not configured on the server", 503);
  }

  if (amount <= 0) {
    throw new AppError("Amount must be greater than zero", 400);
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes,
    });
    console.log("RAZORPAY ORDER:", "hit the", order);

    return order;
  } catch (error) {
    const detail =
      error?.error?.description ||
      error?.message ||
      "Unknown Razorpay error";

    // Log full error object for debugging — contains Razorpay error code/step/reason
    try {
      console.error("[razorpay] create order failed: detail=", detail)
      console.error("[razorpay] full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    } catch (logErr) {
      // Fallback if stringify fails
      console.error("[razorpay] create order failed (unable to stringify error):", error)
    }

    throw new AppError("Failed to create Razorpay order", 502);
  }
};

export const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
}) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
};

export const getRazorpayKeyId = () => env.razorpay.keyId;
