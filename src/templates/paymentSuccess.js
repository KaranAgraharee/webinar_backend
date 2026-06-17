export const paymentSuccessTemplate = ({
  userName,
  webinarTitle,
  amount,
  paymentId,
  orderId,
}) => ({
  subject: `Payment successful: ${webinarTitle}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Successful</h2>
      <p>Hi ${userName},</p>
      <p>Your payment for <strong>${webinarTitle}</strong> was successful.</p>
      <ul>
        <li><strong>Amount Paid:</strong> ₹${amount}</li>
        <li><strong>Order ID:</strong> ${orderId}</li>
        <li><strong>Payment ID:</strong> ${paymentId}</li>
      </ul>
      <p>Your registration is now confirmed. See you at the webinar!</p>
    </div>
  `,
});
