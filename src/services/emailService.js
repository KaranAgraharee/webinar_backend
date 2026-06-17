import { Resend } from "resend";
import { env } from "../config/env.js";
import { registrationConfirmationTemplate } from "../templates/registrationConfirmation.js";
import { paymentSuccessTemplate } from "../templates/paymentSuccess.js";
import { paymentPendingReminderTemplate } from "../templates/paymentPendingReminder.js";
import { webinarReminderTemplate } from "../templates/webinarReminder.js";
import { HOURS_BEFORE_LABELS } from "../config/reminderWindows.js";

const resend = new Resend(env.resend.apiKey);

const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: env.resend.fromEmail,
    to,
    subject,
    html,
  });
  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const sendRegistrationConfirmation = async ({
  email,
  userName,
  webinar,
}) => {
  const { subject, html } = registrationConfirmationTemplate({
    userName,
    webinarTitle: webinar.title,
    date: formatDate(webinar.date),
    time: webinar.time,
    venue: webinar.venue,
    meetingLink: webinar.meetingLink,
    amount: webinar.price,
  });

  return sendEmail({ to: email, subject, html });
};

export const sendPaymentSuccess = async ({
  email,
  userName,
  webinar,
  amount,
  paymentId,
  orderId,
}) => {
  const { subject, html } = paymentSuccessTemplate({
    userName,
    webinarTitle: webinar.title,
    amount,
    paymentId,
    orderId,
  });

  return sendEmail({ to: email, subject, html });
};

export const sendWebinarReminder = async ({
  email,
  userName,
  webinar,
  reminderKey,
}) => {
  const { subject, html } = webinarReminderTemplate({
    userName,
    webinarTitle: webinar.title,
    webinarDescription: webinar.description,
    date: formatDate(webinar.date),
    time: webinar.time,
    venue: webinar.venue,
    meetingLink: webinar.meetingLink,
    hoursBefore: HOURS_BEFORE_LABELS[reminderKey] || reminderKey,
  });

  return sendEmail({ to: email, subject, html });
};

export const sendPaymentPendingReminder = async ({
  email,
  userName,
  webinar,
  amount,
  registerUrl,
}) => {
  const { subject, html } = paymentPendingReminderTemplate({
    userName,
    webinarTitle: webinar.title,
    date: formatDate(webinar.date),
    time: webinar.time,
    venue: webinar.venue,
    amount,
    registerUrl,
  });

  return sendEmail({ to: email, subject, html });
};
