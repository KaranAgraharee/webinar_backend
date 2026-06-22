import Registration from "../models/Registration.js";
import Webinar from "../models/Webinar.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendRegistrationConfirmationSafe } from "../services/notificationService.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const validateRegistrantFields = ({ name, phone, email }) => {
  if (!name || !String(name).trim()) throw new AppError("Name is required", 400);
  if (!phone || !String(phone).trim()) throw new AppError("Phone number is required", 400);
  if (!email || !String(email).trim()) throw new AppError("Email is required", 400);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new AppError("Invalid email address", 400);
};

// ─── POST /api/register  (public, free webinars) ─────────────────────────────

export const registerForWebinar = asyncHandler(async (req, res) => {
  const { webinarId, name, phone, email } = req.body;

  if (!webinarId) throw new AppError("webinarId is required", 400);

  validateRegistrantFields({ name, phone, email });

  const webinar = await Webinar.findById(webinarId);

  if (!webinar || !webinar.isPublished) {
    throw new AppError("Webinar not available for registration", 404);
  }

  // Paid webinars must go through payment flow
  if (webinar.price > 0) {
    throw new AppError(
      "Payment is required for this webinar. Please use the payment flow.",
      400
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Idempotent: already registered with same email → return success
  const existing = await Registration.findOne({
    webinar: webinarId,
    email: normalizedEmail,
  });

  if (existing) {
    return res.status(200).json({
      success: true,
      alreadyRegistered: true,
      message: "You are already registered for this webinar",
      data: { registration: existing },
    });
  }

  const registration = await Registration.create({
    webinar: webinar._id,
    webinarId: webinar._id,
    name: String(name).trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    amount: 0,
    status: "paid",
    paymentStatus: "not_required",
  });

  await sendRegistrationConfirmationSafe({
    email: normalizedEmail,
    userName: String(name).trim(),
    webinar,
  });

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    data: { registration },
  });
});
