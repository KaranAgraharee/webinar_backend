import { getAuth } from "@clerk/express";
import { syncUserFromClerk } from "../services/userService.js";

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
