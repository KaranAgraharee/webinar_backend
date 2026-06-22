import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getRegistrations,
  getRegistrationById,
  exportRegistrations,
  getAdminWebinars,
} from "../controllers/adminController.js";
import {
  createWebinar,
  updateWebinar,
  deleteWebinar,
  togglePublishWebinar,
} from "../controllers/webinarController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/login", adminLogin);

// Protected — all routes below require a valid admin JWT
router.use(protectAdmin);

router.get("/stats", getDashboardStats);
router.get("/registrations", getRegistrations);
router.get("/registrations/:id", getRegistrationById);
router.get("/export", exportRegistrations);
router.get("/webinars", getAdminWebinars);

// Webinar CRUD (admin-only)
router.post("/webinars", createWebinar);
router.put("/webinars/:id", updateWebinar);
router.delete("/webinars/:id", deleteWebinar);
router.patch("/webinars/:id/publish", togglePublishWebinar);

export default router;
