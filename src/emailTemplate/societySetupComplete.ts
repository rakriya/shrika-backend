export const societySetupComplete = ({
  userName,
  razorpayLink,
}: {
  userName: string;
  razorpayLink: string;
}) => {
  return {
    subject: "Society Subscription Setup",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Welcome to Shrika</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f7f7f7; color: #333; padding: 20px; }
        .email-container { max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #4CAF50; }
        .content { line-height: 1.6; }
        .button { display: inline-block; margin: 20px 0; padding: 14px 24px; background-color: #4CAF50; color: white; text-decoration: none; font-size: 16px; border-radius: 6px; }
        .footer { font-size: 12px; color: #888; text-align: center; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎉 Society Setup Complete!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We're excited to inform you that your society setup is now complete on <strong>Shrika</strong>. You're all set to begin your <strong>15-day free trial</strong>!</p>
          <p>To activate your trial and continue using all our powerful features seamlessly after the trial ends, please authorize the monthly auto-debit by saving your eMandate.</p>
          <p style="text-align: center;">
            <a href="${razorpayLink}" class="button">Start Free Trial</a>
          </p>
          <p>No charges during the trial. You can cancel anytime before the first billing.</p>
          <p>Thanks for choosing <strong>Shrika</strong>!</p>
          <p>Warm regards,<br/>The Shrika Team</p>
        </div>
        <div class="footer">
          If you didn’t request this, please ignore this email. This is an automated message from Shrika.
        </div>
      </div>
    </body>
    </html>
  `,
  };
};
