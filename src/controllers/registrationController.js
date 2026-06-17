import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import Webinar from "../models/Webinar.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendRegistrationConfirmationSafe } from "../services/notificationService.js";
import { syncUserFromClerk, fetchAndSyncClerkUser } from "../services/userService.js";

const isFullyRegistered = (registration, webinar) => {
  if (!registration || registration.status !== "paid") {
    return false;
  }

  if (registration.paymentStatus === "paid") {
    return true;
  }

  return registration.paymentStatus === "not_required" && webinar.price <= 0;
};

export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const { webinarId } = req.query;

  if (!webinarId) {
    throw new AppError("webinarId is required", 400);
  }

  const webinar = await Webinar.findById(webinarId);

  if (!webinar || !webinar.isPublished) {
    throw new AppError("Webinar not available", 404);
  }

  const registration = await Registration.findOne({
    webinar: webinar._id,
    user: req.user._id,
  });

  const pendingPayment = await Payment.findOne({
    webinar: webinar._id,
    user: req.user._id,
    status: "created",
  });

  res.status(200).json({
    success: true,
    data: {
      isRegistered: isFullyRegistered(registration, webinar),
      registration,
      hasPendingPayment: Boolean(pendingPayment),
    },
  });
});

export const registerForWebinar = asyncHandler(async (req, res) => {
  const { webinarId, email, name } = req.body;

  req.user = await syncUserFromClerk(req, { email, name });

  if (!webinarId) {
    throw new AppError("webinarId is required", 400);
  }

  const webinar = await Webinar.findById(webinarId);

  if (!webinar || !webinar.isPublished) {
    throw new AppError("Webinar not available for registration", 404);
  }

  const existing = await Registration.findOne({
    webinar: webinarId,
    user: req.user._id,
  });

  if (isFullyRegistered(existing, webinar)) {
    return res.status(200).json({
      success: true,
      alreadyRegistered: true,
      message: "You are already registered for this webinar",
      data: {
        registration: existing,
        requiresPayment: false,
      },
    });
  }

  const isFree = webinar.price <= 0;

  if (!isFree) {
    throw new AppError(
      "Payment is required before registration for this webinar",
      400
    );
  }

  const clerkDetails = await fetchAndSyncClerkUser(req.userId);
  req.user = clerkDetails.user || req.user;

  const finalEmail = email || clerkDetails.email || req.user.email;
  const finalName = name || clerkDetails.name || req.user.name;
  const finalPhone = clerkDetails.phone || req.user.phone || "";

  const registration = await Registration.create({
    webinar: webinar._id,
    webinarId: webinar._id,
    user: req.user._id,
    clerkUserId: req.userId,
    name: finalName,
    email: finalEmail,
    phone: finalPhone,
    amount: webinar.price,
    status: "paid",
    paymentStatus: "not_required",
  });

  await sendRegistrationConfirmationSafe({
    email: req.user.email,
    userName: req.user.name || req.user.email,
    webinar,
  });

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    data: {
      registration,
      requiresPayment: false,
    },
  });
});
