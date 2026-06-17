import express from "express";
import { getWebinarAttendees } from "../controllers/adminController.js";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/webinars/:webinarId/attendees",
  protectRoute,
  requireAdmin,
  getWebinarAttendees
);

export default router;
