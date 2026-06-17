export const paymentPendingReminderTemplate = ({
  userName,
  webinarTitle,
  date,
  time,
  venue,
  amount,
  registerUrl,
}) => {
  const subject = `Register now for ${webinarTitle} — just ₹${amount}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2>Hi ${userName},</h2>
      <p>Your seat for <strong>${webinarTitle}</strong> is not confirmed yet.</p>
      <p>Complete your registration for just <strong>₹${amount}</strong> and join the live session.</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Venue:</strong> ${venue}</li>
      </ul>
      ${
        registerUrl
          ? `<p><a href="${registerUrl}">Register now for ₹${amount}</a></p>`
          : ""
      }
      <p>Thanks,<br/>Webinar Team</p>
    </div>
  `;

  return { subject, html };
};
