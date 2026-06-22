import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import Webinar from "../models/Webinar.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  verifyRazorpaySignature,
} from "../services/razorpayService.js";
import {
  sendPaymentSuccessSafe,
  sendRegistrationConfirmationSafe,
} from "../services/notificationService.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const validateRegistrantFields = ({ name, phone, email }) => {
  if (!name || !String(name).trim()) throw new AppError("Name is required", 400);
  if (!phone || !String(phone).trim()) throw new AppError("Phone number is required", 400);
  if (!email || !String(email).trim()) throw new AppError("Email is required", 400);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new AppError("Invalid email address", 400);
};

// ─── POST /api/payment/create-order  (public) ────────────────────────────────

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { webinarId, name, phone, email } = req.body;

  if (!webinarId) throw new AppError("webinarId is required", 400);

  validateRegistrantFields({ name, phone, email });

  const webinar = await Webinar.findById(webinarId);
  if (!webinar || !webinar.isPublished) {
    throw new AppError("Webinar not available", 404);
  }

  if (webinar.price <= 0) {
    throw new AppError("No payment required for this webinar", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Already registered and paid → return early
  const existingRegistration = await Registration.findOne({
    webinar: webinar._id,
    email: normalizedEmail,
    paymentStatus: "paid",
  });

  if (existingRegistration) {
    return res.status(200).json({
      success: true,
      alreadyRegistered: true,
      message: "You are already registered for this webinar",
    });
  }

  // Reuse a recently created order (within 15 min) for the same email+webinar
  const existingPayment = await Payment.findOne({
    webinar: webinar._id,
    email: normalizedEmail,
    status: "created",
  });

  if (
    existingPayment &&
    Date.now() - new Date(existingPayment.createdAt).getTime() < 15 * 60 * 1000
  ) {
    return res.status(200).json({
      success: true,
      data: {
        orderId: existingPayment.razorpayOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        key: getRazorpayKeyId(),
        webinarId: webinar._id,
      },
    });
  }

  const receipt = `wbn_${String(webinar._id).slice(-10)}_${String(Date.now()).slice(-8)}`;
  const order = await createRazorpayOrder({
    amount: webinar.price,
    receipt,
    notes: {
      webinarId: String(webinar._id),
      email: normalizedEmail,
    },
  });
  await Payment.create({
    webinar: webinar._id,
    email: normalizedEmail,
    name: String(name).trim(),
    phone: String(phone).trim(),
    razorpayOrderId: order.id,
    amount: webinar.price,
    currency: order.currency,
    status: "created",
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: webinar.price,
      currency: order.currency,
      key: getRazorpayKeyId(),
      webinarId: webinar._id,
    },
  });
});

// ─── POST /api/payment/verify  (public) ──────────────────────────────────────

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    webinarId,
    name,
    email,
    phone,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Missing Razorpay payment verification fields", 400);
  }

  const isValid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    throw new AppError("Invalid payment signature", 400);
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  // Normalise email from payment record (source of truth for this order)
  const finalEmail = payment.email;
  const finalName = payment.name || (name ? String(name).trim() : "");
  const finalPhone = payment.phone || (phone ? String(phone).trim() : "");

  if (webinarId && String(payment.webinar) !== String(webinarId)) {
    throw new AppError("Webinar does not match payment order", 400);
  }

  // Idempotent: already verified
  if (payment.status === "paid") {
    const paidRegistration = await Registration.findOne({
      webinar: payment.webinar,
      email: finalEmail,
    });
    return res.status(200).json({
      success: true,
      message: "Payment already verified",
      data: { payment, registration: paidRegistration },
    });
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "paid";
  await payment.save();

  const webinar = await Webinar.findById(payment.webinar);

  if (!webinar || !webinar.isPublished) {
    throw new AppError("Webinar not available", 404);
  }

  // Upsert registration
  let registration = await Registration.findOne({
    webinar: payment.webinar,
    email: finalEmail,
  });

  if (!registration) {
    registration = await Registration.create({
      webinar: payment.webinar,
      webinarId: payment.webinar,
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      amount: payment.amount,
      status: "paid",
      paymentStatus: "paid",
    });
  } else {
    registration.status = "paid";
    registration.paymentStatus = "paid";
    registration.amount = payment.amount;
    if (finalName) registration.name = finalName;
    if (finalPhone) registration.phone = finalPhone;
    await registration.save();
  }

  payment.registration = registration._id;
  await payment.save();

  // Send emails (non-blocking)
  await sendPaymentSuccessSafe({
    email: finalEmail,
    userName: finalName || finalEmail,
    webinar,
    amount: payment.amount,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });

  await sendRegistrationConfirmationSafe({
    email: finalEmail,
    userName: finalName || finalEmail,
    webinar,
  });

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: { payment, registration },
  });
});
