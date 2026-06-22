import express from "express";
import { registerForWebinar } from "../controllers/registrationController.js";

const router = express.Router();

// Public — no authentication required
router.post("/register", registerForWebinar);

export default router;
