import { asyncHandler } from "../utils/asyncHandler.js";
import { syncUserFromClerk } from "../services/userService.js";

export const syncAuthUser = asyncHandler(async (req, res) => {
  const { email, name } = req.body ?? {};

  const user = await syncUserFromClerk(req, {
    email,
    name,
  });
 console.log(user)
  res.status(200).json({
    success: true,
    message: "User saved successfully",
    data: user,
  });
});
