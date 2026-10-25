const nodemailer = require('nodemailer');

/**
 * Creates Nodemailer Gmail transporter using environment variables
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ [sendEmailOtp] EMAIL_USER or EMAIL_PASS not configured in .env. Skipping email dispatch.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ''), // Supports Gmail App Password with or without spaces
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
};

/**
 * Send dark-themed HTML OTP email to Gym Owner (Verification or Password Reset)
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} options.otp
 * @param {string} [options.gymName]
 * @param {string} [options.ownerName]
 * @param {'VERIFICATION'|'PASSWORD_RESET'} [options.type]
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
const sendEmailOtp = async ({
  toEmail,
  otp,
  gymName = 'Your Gym',
  ownerName = 'Gym Owner',
  type = 'VERIFICATION',
}) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'Email credentials not configured in environment variables.' };
    }

    const isReset = type === 'PASSWORD_RESET';
    const emailSubject = isReset
      ? `🔑 Reset Your GymFlow Password: ${otp}`
      : `🔐 Your GymFlow Verification Code: ${otp}`;
    const headerTitle = isReset ? 'Reset Your Password' : 'Verify Your Account';
    const mainMessage = isReset
      ? `We received a request to reset the password for your <strong style="color: #00F59B;">${gymName}</strong> account. Please use the following 6-digit One-Time Password (OTP) to set up your new password:`
      : `Thank you for onboarding <strong style="color: #00F59B;">${gymName}</strong> to GymFlow. Please use the following 6-digit One-Time Password (OTP) to verify your account and activate your dashboard:`;
    const boxTitle = isReset ? 'Password Reset Code' : 'Your Verification OTP';
    const disclaimer = isReset
      ? 'If you did not request a password reset, your account is safe and you can safely ignore this email.'
      : 'If you did not initiate this registration, please disregard this email or contact support.';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle} - GymFlow</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080c14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #080c14; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.6); overflow: hidden;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; background: linear-gradient(180deg, #131d35 0%, #0f172a 100%); border-bottom: 1px solid #1e293b;">
              <div style="display: inline-block; padding: 12px; background: rgba(0, 245, 155, 0.12); border: 1px solid rgba(0, 245, 155, 0.3); border-radius: 50%; margin-bottom: 12px;">
                <span style="font-size: 28px;">${isReset ? '🔑' : '⚡'}</span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                Gym<span style="color: #00F59B;">Flow</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                Gym Management & Indian AI Diet OS
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 20px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
                Hello <strong style="color: #ffffff;">${ownerName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                ${mainMessage}
              </p>

              <!-- OTP Code Box -->
              <div style="background: #020617; border: 1.5px dashed #00F59B; border-radius: 14px; padding: 22px; text-align: center; margin: 28px 0;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
                  ${boxTitle}
                </span>
                <span style="display: inline-block; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #00F59B; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 16px rgba(0, 245, 155, 0.4);">
                  ${otp}
                </span>
                <span style="display: block; font-size: 12px; color: #f59e0b; margin-top: 10px; font-weight: 600;">
                  ⏳ Valid for 10 minutes only
                </span>
              </div>

              <!-- Security Tips -->
              <div style="background: rgba(30, 41, 59, 0.5); border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                  🔒 <strong>Security Tip:</strong> Never share this OTP with anyone. The GymFlow team will never ask for your password or verification code.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                ${disclaimer}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} GymFlow Inc. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                Automated Security Notification • Do not reply directly to this email
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"GymFlow Security" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: emailSubject,
      text: `Hello ${ownerName},\n\nYour GymFlow code for ${gymName} is: ${otp}\nThis code is valid for 10 minutes.\n\nNever share this code with anyone.\n\n- GymFlow Team`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [sendEmailOtp] OTP email sent successfully to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [sendEmailOtp] Error sending OTP email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmailOtp;
