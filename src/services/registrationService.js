import Registration from "../models/Registration.js";
import Webinar from "../models/Webinar.js";
import { AppError } from "../utils/AppError.js";

export const createRegistration = async ({
  webinarId,
  name,
  email,
  phone,
}) => {
  const webinar = await Webinar.findById(webinarId);

  if (!webinar || !webinar.isPublished) {
    throw new AppError("Webinar not available", 404);
  }

  const existing = await Registration.findOne({
    webinar: webinarId,
    email,
  });

  if (existing) {
    return {
      alreadyRegistered: true,
      registration: existing,
    };
  }

  const registration = await Registration.create({
    webinar: webinar._id,
    webinarId: webinar._id,
    name,
    email,
    phone,
    amount: webinar.price,
    status: webinar.price > 0 ? "pending" : "paid",
    paymentStatus:
      webinar.price > 0 ? "pending" : "not_required",
  });

  return {
    alreadyRegistered: false,
    registration,
  };
};
