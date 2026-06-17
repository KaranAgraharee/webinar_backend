export const webinarReminderTemplate = ({
  userName,
  webinarTitle,
  webinarDescription,
  date,
  time,
  venue,
  meetingLink,
  hoursBefore,
}) => {
  const descriptionText = webinarDescription ? String(webinarDescription) : "";

  // Keep subjects short but include the webinar's theme (e.g. "toxic relationship patterns").
  const themeMatch =
    descriptionText.match(/toxic relationship[^.]+/i) ||
    descriptionText.split(/[.!?]/)[0] ||
    "";
  const themeSnippet = String(themeMatch).trim().slice(0, 70).trim();

  const subject = themeSnippet
    ? `Reminder: ${themeSnippet} (starts in ${hoursBefore})`
    : `Reminder: ${webinarTitle} starts in ${hoursBefore}`;

  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Webinar Reminder</h2>
        <p>Hi ${userName},</p>
        <p>This is a reminder that <strong>${webinarTitle}</strong> starts in <strong>${hoursBefore}</strong>.</p>
        ${
          webinarDescription
            ? `<p style="margin-top: 10px;">${webinarDescription}</p>`
            : ""
        }
        <ul>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Venue:</strong> ${venue}</li>
          ${
            meetingLink
              ? `<li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>`
              : ""
          }
        </ul>
        <p>We look forward to seeing you there!</p>
      </div>
    `,
  };
};
