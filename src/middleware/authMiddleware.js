import { getAuth } from "@clerk/express";
import { syncUserFromClerk } from "../services/userService.js";
import { env } from "../config/env.js";

/**
 * API auth: validates Bearer JWT via clerkMiddleware + getAuth.
 * Returns 401 JSON (no redirect) — required for SPA clients.
 */
export const protectRoute = async (req, res, next) => {
  try {
    const auth = getAuth(req);

    if (!auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — sign in and try again",
      });
    }

    req.auth = auth;
    req.userId = auth.userId;
    req.user = await syncUserFromClerk(req);

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Admin auth: validates that the logged-in Clerk user ID is configured as an admin.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — sign in and try again",
      });
    }

    const isAdmin = env.adminClerkUserIds.includes(req.userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden — admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
