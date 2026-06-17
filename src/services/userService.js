import User from "../models/User.js";

const getEmailFromAuth = (req, overrides = {}) => {
  if (overrides.email) return overrides.email;

  return (
    req.auth?.sessionClaims?.email ||
    req.auth?.sessionClaims?.primary_email_address ||
    req.auth?.sessionClaims?.primaryEmailAddress ||
    req.auth?.sessionClaims?.email_address ||
    null
  );
};

const getNameFromAuth = (req, overrides = {}) => {
  if (overrides.name) return overrides.name;

  const fromClaims =
    req.auth?.sessionClaims?.name ||
    req.auth?.sessionClaims?.full_name ||
    [
      req.auth?.sessionClaims?.given_name,
      req.auth?.sessionClaims?.family_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return fromClaims || "";
};

export const syncUserFromClerk = async (req, overrides = {}) => {
  const clerkUserId = req.auth.userId;
  const email =
    getEmailFromAuth(req, overrides) || `${clerkUserId}@clerk.local`;
  const name = getNameFromAuth(req, overrides) || email.split("@")[0];

  let user = await User.findOne({ clerkUserId });

  if (user) {
    user.email = email;
    user.name = name;
    await user.save();
    return user;
  }

  user = await User.create({
    clerkUserId,
    email,
    name,
  });

  return user;
};
