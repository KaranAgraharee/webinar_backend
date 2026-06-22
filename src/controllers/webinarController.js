import Webinar from "../models/Webinar.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWebinars = asyncHandler(async (req, res) => {
  const webinars = await Webinar.find({ isPublished: true })
    .sort({ date: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: webinars.length,
    data: webinars,
  });
});

export const getWebinarById = asyncHandler(async (req, res) => {
  const webinar = await Webinar.findById(req.params.id).lean();

  if (!webinar) {
    throw new AppError("Webinar not found", 404);
  }

  if (!webinar.isPublished) {
    throw new AppError("Webinar not found", 404);
  }

  res.status(200).json({
    success: true,
    data: webinar,
  });
});

export const createWebinar = asyncHandler(async (req, res) => {
  const { title, description, date, time, venue, meetingLink, price, isPublished } = req.body;

  if (!title || !description || !date || !time || !venue) {
    throw new AppError("Please provide all required webinar fields", 400);
  }

  const webinar = await Webinar.create({
    title,
    description,
    date,
    time,
    venue,
    meetingLink: meetingLink || "",
    price: price ?? 0,
    isPublished: Boolean(isPublished),
    createdByEmail: req.adminEmail || "",
  });

  res.status(201).json({
    success: true,
    message: "Webinar created successfully",
    data: webinar,
  });
});

export const updateWebinar = asyncHandler(async (req, res) => {
  const webinar = await Webinar.findById(req.params.id);

  if (!webinar) {
    throw new AppError("Webinar not found", 404);
  }

  const fields = [
    "title",
    "description",
    "date",
    "time",
    "venue",
    "meetingLink",
    "price",
    "isPublished",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      webinar[field] = req.body[field];
    }
  });

  await webinar.save();

  res.status(200).json({
    success: true,
    message: "Webinar updated successfully",
    data: webinar,
  });
});

export const deleteWebinar = asyncHandler(async (req, res) => {
  const webinar = await Webinar.findByIdAndDelete(req.params.id);

  if (!webinar) {
    throw new AppError("Webinar not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Webinar deleted successfully",
  });
});

export const togglePublishWebinar = asyncHandler(async (req, res) => {
  const webinar = await Webinar.findById(req.params.id);

  if (!webinar) {
    throw new AppError("Webinar not found", 404);
  }

  if (req.body.isPublished !== undefined) {
    webinar.isPublished = Boolean(req.body.isPublished);
  } else {
    webinar.isPublished = !webinar.isPublished;
  }

  await webinar.save();

  res.status(200).json({
    success: true,
    message: webinar.isPublished
      ? "Webinar published successfully"
      : "Webinar unpublished successfully",
    data: webinar,
  });
});
