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

const isFullyRegistered = (registration, webinar) => {
  if (!registration || registration.status !== "paid") {
    return false;
  }

  if (registration.paymentStatus === "paid") {
    return true;
  }

  return registration.paymentStatus === "not_required" && webinar.price <= 0;
};

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { webinarId } = req.body;
  if (!webinarId) {
    throw new AppError("webinarId is required", 400);
  }

  const webinar = await Webinar.findById(webinarId);

  if (!webinar || !webinar.isPublished) {
    throw new AppError("Webinar not available", 404);
  }

  if (webinar.price <= 0) {
    throw new AppError("No payment required for this webinar", 400);
  }

  const existingRegistration = await Registration.findOne({
    webinar: webinar._id,
    user: req.user._id,
  });
  if (isFullyRegistered(existingRegistration, webinar)) {
    return res.status(200).json({
      success: true,
      alreadyRegistered: true,
      message: "You are already registered for this webinar",
    });
  }

  const existingPayment = await Payment.findOne({
    webinar: webinar._id,
    user: req.user._id,
    status: "created",
  });


  if (existingPayment &&
  Date.now() - existingPayment.createdAt < 15 * 60 * 1000) {
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

  const receipt = `wbn_${String(webinar._id).slice(-10)}_${String(
    Date.now()
  ).slice(-8)}`;

  const order = await createRazorpayOrder({
    amount: webinar.price,
    receipt,
    notes: {
      webinarId: String(webinar._id),
      userId: String(req.user._id),
    },
  });
  await Payment.create({
    user: req.user._id,
    webinar: webinar._id,
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

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    webinarId,
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

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  if (String(payment.user) !== String(req.user._id)) {
    throw new AppError("Not authorized for this payment", 403);
  }

  if (webinarId && String(payment.webinar) !== String(webinarId)) {
    throw new AppError("Webinar does not match payment order", 400);
  }

  if (payment.status === "paid") {
    const paidRegistration = await Registration.findOne({
      webinar: payment.webinar,
      user: req.user._id,
      clerkUserId: req.userId,
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
  const user = req.user;

  if (!webinar || !webinar.isPublished) {
    throw new AppError("Webinar not available", 404);
  }

  let registration = await Registration.findOne({
    webinar: payment.webinar,
    user: req.user._id,
  });

  if (!registration) {
    registration = await Registration.create({
      webinar: payment.webinar,
      user: req.user._id,
      clerkUserId: req.userId,
      amount: payment.amount,
      status: "paid",
      paymentStatus: "paid",
    });
  } else {
    registration.status = "paid";
    registration.paymentStatus = "paid";
    registration.amount = payment.amount;
    await registration.save();
  }

  payment.registration = registration._id;
  await payment.save();

  await sendPaymentSuccessSafe({
    email: user.email,
    userName: user.name || user.email,
    webinar,
    amount: payment.amount,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });

  await sendRegistrationConfirmationSafe({
    email: user.email,
    userName: user.name || user.email,
    webinar,
  });

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: { payment, registration },
  });
});
