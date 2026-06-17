import express from "express";
import {
  getRegistrationStatus,
  registerForWebinar,
} from "../controllers/registrationController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/register/status", protectRoute, getRegistrationStatus);
router.post("/register", protectRoute, registerForWebinar);

export default router;
