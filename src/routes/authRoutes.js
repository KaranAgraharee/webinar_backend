import express from "express";
import { syncAuthUser } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sync", protectRoute, syncAuthUser);

export default router;
