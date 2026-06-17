import { clerkClient } from "@clerk/express";
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

export const fetchAndSyncClerkUser = async (clerkUserId) => {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "";
    const phone =
      clerkUser.phoneNumbers.find((p) => p.id === clerkUser.primaryPhoneNumberId)?.phoneNumber ||
      clerkUser.phoneNumbers[0]?.phoneNumber ||
      "";
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      email.split("@")[0] ||
      "";

    let user = await User.findOne({ clerkUserId });
    if (user) {
      user.email = email;
      user.name = name;
      user.phone = phone;
      await user.save();
    } else {
      user = await User.create({
        clerkUserId,
        email,
        name,
        phone,
      });
    }

    return { name, email, phone, user };
  } catch (error) {
    console.error(`Error fetching/syncing clerk user ${clerkUserId}:`, error);
    // Fallback: fetch local user if exists
    const user = await User.findOne({ clerkUserId });
    return {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      user,
    };
  }
};
