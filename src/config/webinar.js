/**
 * Single webinar for this landing page (not stored per registration/payment).
 * Keep in sync with client/src/assets/Constants/Detail.js and hero copy.
 */
export const webinarConfig = {
  title: "Heal. Grow. Transform.",
  description:
    "Break free from toxic relationship patterns and rebuild self-worth in this live 90-minute healing webinar.",
  date: new Date(process.env.WEBINAR_DATE || "2026-06-20T00:00:00.000Z"),
  time: process.env.WEBINAR_TIME || "11:30 AM",
  venue: process.env.WEBINAR_VENUE || "Live Online Webinar",
  meetingLink: process.env.WEBINAR_MEETING_LINK || "",
  price: Number(process.env.WEBINAR_PRICE) || 499,
};
