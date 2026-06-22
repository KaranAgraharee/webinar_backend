import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const razorpay = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});
export const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new AppError("Payment gateway is not configured on the server", 503);
  }

  if (amount <= 0) {
    throw new AppError("Amount must be greater than zero", 400);
  }

  let order;
  try {
    order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes,
    });
  } catch (error) {
    // Razorpay SDK v4 bug: normalizeError crashes with "Cannot read properties of
    // undefined (reading 'status')" when the underlying HTTP response is missing.
    // This usually means a network error reaching api.razorpay.com, or an invalid
    // key causing a non-JSON response that the SDK cannot parse.
    const isSDKCrash =
      error instanceof TypeError &&
      error.message?.includes("Cannot read properties of undefined");
    const detail = isSDKCrash
      ? "Razorpay SDK internal error — check network or API key"
      : error?.error?.description ||
        error?.message ||
        "Unknown Razorpay error";

    try {
      console.error("[razorpay] create order failed:", detail);
      if (!isSDKCrash) {
        console.error(
          "[razorpay] full error:",
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        );
      }
    } catch (_) {
      console.error("[razorpay] create order failed (unstringifiable):", error);
    }

    throw new AppError("Failed to create Razorpay order", 502);
  }

  if (!order || !order.id) {
    console.error("[razorpay] order created but response malformed:", order);
    throw new AppError("Failed to create Razorpay order", 502);
  }

  return order;
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
