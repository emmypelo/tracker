import { createTransport } from "nodemailer";

const sendPasswordMail = async (to, token) => {
  try {
    console.log("Attempting to send email to:", to);

    // 1. Create transporter with better configuration
    const transporter = createTransport({
      service: "gmail", 
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, 
      },
    });

    // 2. Verify transporter configuration
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // 3. Create the message
    const message = {
      from: process.env.GMAIL_USER,
      to,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px;">
            <tr>
              <td style="padding: 30px;">
                <h1 style="color: #4a4a4a; margin-bottom: 20px;">Password Reset Request</h1>
                <p style="margin-bottom: 15px;">You are receiving this email because a password reset was requested for your account.</p>
                <p style="margin-bottom: 25px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <a href="${
                  process.env.FRONTEND_URL ||
                  "https://tracker-rust-zeta.vercel.app"
                }/reset-password/${token}" 
                   style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">
                   Reset Your Password
                </a>
                <p style="margin-top: 25px; font-size: 0.9em; color: #666;">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 0.9em; color: #666; word-break: break-all;">
                  ${
                    process.env.FRONTEND_URL ||
                    "https://tracker-rust-zeta.vercel.app"
                  }/reset-password/${token}
                </p>
                <p style="margin-top: 30px; font-size: 0.8em; color: #999;">This is an automated message, please do not reply.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // 4. Send the email
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email sending error:", error);

    // Provide more specific error messages
    if (error.code === "EAUTH") {
      throw new Error(
        "Gmail authentication failed. Please check your credentials and enable App Password."
      );
    } else if (error.code === "ECONNECTION") {
      throw new Error("Failed to connect to Gmail SMTP server.");
    } else {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
};

export default sendPasswordMail;
