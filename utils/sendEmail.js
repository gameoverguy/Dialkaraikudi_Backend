const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #333333;">Welcome to <span style="color: #007BFF;">Dialkaraikudi</span>!</h2>
          <p style="font-size: 16px; color: #555;">Use the following One-Time Password (OTP) to complete your login or verification process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 28px; letter-spacing: 6px; background: #007BFF; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #888;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #aaa;">If you didn’t request this, please ignore this email.</p>
          <p style="font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} Dialkaraikudi. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Dialkaraikudi" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email sending failed.");
  }
};

module.exports = sendEmail;
