import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Registration from "../models/Registration.js";
import Webinar from "../models/Webinar.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

// ─── Admin Login ─────────────────────────────────────────────────────────────

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail !== env.admin.email.toLowerCase()) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!env.admin.passwordHash) {
    throw new AppError("Admin not configured on server", 500);
  }

  const isMatch = await bcrypt.compare(password, env.admin.passwordHash);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { email: normalizedEmail, role: "admin" },
    env.jwtSecret,
    { expiresIn: "8h" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { token, expiresIn: "8h" },
  });
});

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalRegistrations, totalPaid, webinars] = await Promise.all([
    Registration.countDocuments(),
    Registration.countDocuments({ paymentStatus: "paid" }),
    Webinar.find({ isPublished: true }).select("title date price").lean(),
  ]);

  // Per-webinar registration counts
  const webinarIds = webinars.map((w) => w._id);
  const webinarCounts = await Registration.aggregate([
    { $match: { webinar: { $in: webinarIds } } },
    { $group: { _id: "$webinar", count: { $sum: 1 }, paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } } } },
  ]);

  const webinarCountMap = {};
  webinarCounts.forEach((w) => {
    webinarCountMap[String(w._id)] = { count: w.count, paid: w.paid };
  });

  const webinarStats = webinars.map((w) => ({
    _id: w._id,
    title: w.title,
    date: w.date,
    price: w.price,
    registrations: webinarCountMap[String(w._id)]?.count || 0,
    paidRegistrations: webinarCountMap[String(w._id)]?.paid || 0,
  }));

  res.status(200).json({
    success: true,
    data: {
      totalRegistrations,
      totalPaid,
      webinarStats,
    },
  });
});

// ─── Get Registrations (paginated + search + filter) ─────────────────────────

export const getRegistrations = asyncHandler(async (req, res) => {
  const {
    search,
    webinarId,
    paymentStatus,
    page = 1,
    limit = 50,
  } = req.query;

  const query = {};

  if (webinarId) query.webinar = webinarId;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [registrations, total] = await Promise.all([
    Registration.find(query)
      .populate("webinar", "title date price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Registration.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: registrations,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

// ─── Get Single Registration ─────────────────────────────────────────────────

export const getRegistrationById = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id)
    .populate("webinar", "title date time venue price meetingLink")
    .lean();

  if (!registration) {
    throw new AppError("Registration not found", 404);
  }

  res.status(200).json({
    success: true,
    data: registration,
  });
});

// ─── Export Registrations as CSV ─────────────────────────────────────────────

export const exportRegistrations = asyncHandler(async (req, res) => {
  const { webinarId, paymentStatus } = req.query;

  const query = {};
  if (webinarId) query.webinar = webinarId;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const registrations = await Registration.find(query)
    .populate("webinar", "title date")
    .sort({ createdAt: -1 })
    .lean();

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Webinar",
    "Webinar Date",
    "Amount",
    "Payment Status",
    "Status",
    "Registration Date",
  ];

  const csvRows = [headers.join(",")];

  for (const r of registrations) {
    const row = [
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      `"${(r.phone || "").replace(/"/g, '""')}"`,
      `"${(r.webinar?.title || "").replace(/"/g, '""')}"`,
      `"${r.webinar?.date ? new Date(r.webinar.date).toLocaleDateString("en-IN") : ""}"`,
      `"${r.amount ?? ""}"`,
      `"${r.paymentStatus}"`,
      `"${r.status}"`,
      `"${new Date(r.createdAt).toISOString()}"`,
    ];
    csvRows.push(row.join(","));
  }

  const filename = webinarId
    ? `registrations-webinar-${webinarId}.csv`
    : `registrations-all-${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  return res.status(200).send(csvRows.join("\n"));
});

// ─── Get all webinars for admin (including unpublished) ──────────────────────

export const getAdminWebinars = asyncHandler(async (req, res) => {
  const webinars = await Webinar.find().sort({ date: -1 }).lean();

  res.status(200).json({
    success: true,
    count: webinars.length,
    data: webinars,
  });
});
