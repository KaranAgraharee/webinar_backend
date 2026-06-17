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
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Webinar Invitation</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 15px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#8B2C4A;padding:30px;color:#ffffff;">
              <h1 style="margin:0;">You're Registered!</h1>
              <p style="margin:10px 0 0;font-size:16px;">
                Toxic Relationship Webinar
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px;color:#333333;line-height:1.6;">

              <p>Hello,</p>

              <p>
                Thank you for registering for the
                <strong>Toxic Relationship Webinar</strong>
                hosted by
                <strong>Khushboo Khushnay – Relationship Expert & Healer</strong>.
              </p>

              <table width="100%" style="background:#faf7f8;border-radius:8px;padding:15px;margin:20px 0;">
                <tr>
                  <td>
                    <strong>📅 Date:</strong> June 20, 2026<br>
                    <strong>🕚 Time:</strong> 11:30 AM IST<br>
                    <strong>🎤 Host:</strong> Khushboo Khushnay
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href="https://us06web.zoom.us/j/83698518623?pwd=OBS4YrbbNNW2zyLsCvabLFdRCaclvb.1"
                   style="background:#8B2C4A;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:6px;font-weight:bold;display:inline-block;">
                  Join Webinar
                </a>
              </div>

              <h3>Meeting Details</h3>

              <p>
                <strong>Meeting ID:</strong> 836 9851 8623<br>
                <strong>Passcode:</strong> 475249
              </p>

              <p>
                <strong>Meeting Chat:</strong><br>
                <a href="https://us06web.zoom.us/launch/jc/83698518623">
                  Open Meeting Chat
                </a>
              </p>

              <p>
                Please join the webinar 5–10 minutes before the scheduled time.
              </p>

              <p>
                We look forward to helping you identify, understand, and break unhealthy relationship patterns.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f8f8f8;padding:20px;color:#666666;font-size:13px;">
              <strong>Khushboo Khushnay</strong><br>
              Relationship Expert & Healer
              <br><br>
              This email was sent because you registered for the webinar.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `,
});
