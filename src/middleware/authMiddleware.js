import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * JWT-based admin middleware.
 * Expects: Authorization: Bearer <token>
 * Sets req.admin = true on success.
 */
export const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Allow token as query param for file downloads (CSV export)
    const queryToken = req.query.token;

    if (!authHeader && !queryToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — admin token required",
      });
    }

    const token = queryToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — admin token required",
      });
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden — invalid admin token",
      });
    }

    req.admin = true;
    req.adminEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired — please log in again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized — invalid token",
    });
  }
};
