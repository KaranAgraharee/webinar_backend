import express from "express";
import {
  getWebinarById,
  getWebinars,
} from "../controllers/webinarController.js";

const router = express.Router();

router.get("/", getWebinars);
router.get("/:id", getWebinarById);

export default router;
