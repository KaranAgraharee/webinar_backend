export const registrationConfirmationTemplate = ({
  userName,
  webinarTitle,
  date,
  time,
  venue,
  meetingLink,
  amount,
}) => ({
  subject: `Registration confirmed: ${webinarTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Registration Confirmed</h2>
      <p>Hi ${userName},</p>
      <p>You have successfully registered for <strong>${webinarTitle}</strong>.</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Venue:</strong> ${venue}</li>
        ${meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>` : ""}
        <li><strong>Amount:</strong> ₹${amount}</li>
      </ul>
      <p>We will send you reminder emails before the webinar starts.</p>
    </div>
  `,
});
