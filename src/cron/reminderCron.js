import cron from "node-cron";
import Registration from "../models/Registration.js";
import Payment from "../models/Payment.js";
import { webinarConfig } from "../config/webinar.js";
import { env } from "../config/env.js";
import { getWebinarStartDateTime } from "../utils/webinarDateTime.js";
import {
  sendPaymentPendingReminder,
  sendWebinarReminder,
} from "../services/emailService.js";
import { REMINDER_WINDOWS } from "../config/reminderWindows.js";

const startsAt = () => getWebinarStartDateTime(webinarConfig);

const isWebinarUpcoming = () => startsAt().getTime() > Date.now();

const isWithinReminderWindow = (start, hoursBefore, toleranceMinutes) => {
  const now = Date.now();
  const target = start.getTime() - hoursBefore * 60 * 60 * 1000;
  const tolerance = toleranceMinutes * 60 * 1000;
  return now >= target - tolerance && now <= target + tolerance;
};

const getTodayDateStamp = () => new Date().toISOString().slice(0, 10);

export const processWebinarReminders = async () => {
  if (!isWebinarUpcoming()) return;

  const start = startsAt();

  // Use inline fields (no user population needed)
  const registrations = await Registration.find({ status: "paid" }).lean();

  for (const registration of registrations) {
    if (!registration.email) continue;

    for (const window of REMINDER_WINDOWS) {
      if (registration.remindersSent?.includes(window.key)) continue;

      if (!isWithinReminderWindow(start, window.hours, window.toleranceMinutes)) {
        continue;
      }

      try {
        await sendWebinarReminder({
          email: registration.email,
          userName: registration.name || registration.email,
          webinar: webinarConfig,
          reminderKey: window.key,
        });

        await Registration.findByIdAndUpdate(registration._id, {
          $addToSet: { remindersSent: window.key },
        });

        console.log(
          `Reminder ${window.key} sent for registration ${registration._id}`
        );
      } catch (error) {
        console.error(
          `Failed to send ${window.key} reminder for registration ${registration._id}:`,
          error.message
        );
      }
    }
  }
};

export const processPendingPaymentReminders = async () => {
  if (!isWebinarUpcoming()) return;

  // Use inline fields on Payment (no user population needed)
  const payments = await Payment.find({ status: "created" }).lean();
  const todayStamp = getTodayDateStamp();

  for (const payment of payments) {
    if (!payment.email) continue;
    if (payment.lastPaymentReminderDate === todayStamp) continue;

    try {
      await sendPaymentPendingReminder({
        email: payment.email,
        userName: payment.name || payment.email,
        webinar: webinarConfig,
        amount: payment.amount ?? webinarConfig.price,
        registerUrl: env.clientUrl,
      });

      await Payment.findByIdAndUpdate(payment._id, {
        lastPaymentReminderDate: todayStamp,
      });

      console.log(
        `Daily pending-payment reminder sent for payment ${payment._id}`
      );
    } catch (error) {
      console.error(
        `Failed to send pending-payment reminder for payment ${payment._id}:`,
        error.message
      );
    }
  }
};

export const startReminderCron = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      await processWebinarReminders();
    } catch (error) {
      console.error("Reminder cron error:", error);
    }
  });

  cron.schedule("0 10 * * *", async () => {
    try {
      await processPendingPaymentReminders();
    } catch (error) {
      console.error("Pending-payment reminder cron error:", error);
    }
  });

  console.log(
    "Reminder cron scheduled: webinar (every 10 min), pending-payment (daily at 10:00)"
  );
};
