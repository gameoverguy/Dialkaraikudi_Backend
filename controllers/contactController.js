const ContactMessage = require("../models/ContactMessage");
const nodemailer = require("nodemailer");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "karthick251087@gmail.com";

const contactUs = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    // Save to database
    const newMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    const mailHtml = `
  <div style="max-width: 680px; margin: auto; font-family: 'Segoe UI', sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    
    <div style="background: linear-gradient(to right, #667eea, #764ba2); padding: 24px; color: #fff; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">📩 New Contact Us Message</h1>
      <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Received via your website</p>
    </div>

    <div style="background-color: #ffffff; padding: 24px;">
      <table style="width: 100%; font-size: 15px; color: #2d3748;">
        <tr>
          <td style="padding: 8px 0; width: 120px;"><strong>Name:</strong></td>
          <td>${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Email:</strong></td>
          <td><a href="mailto:${email}" style="color: #3182ce;">${email}</a></td>
        </tr>
         <tr>
          <td style="padding: 8px 0;"><strong>Email:</strong></td>
          <td><a href="mailto:${phone}" style="color: #3182ce;">${phone}</a></td>
        </tr>
        ${
          subject
            ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Subject:</strong></td>
          <td>${subject}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding: 8px 0;"><strong>Received:</strong></td>
          <td>${new Date().toLocaleString()}</td>
        </tr>
      </table>

      <div style="margin-top: 24px;">
        <h3 style="margin-bottom: 12px; color: #4a5568;">📝 Message</h3>
        <div style="padding: 16px; background-color: #f7fafc; border-left: 4px solid #667eea; border-radius: 6px; line-height: 1.6; white-space: pre-wrap;">
          ${message.replace(/\n/g, "<br/>")}
        </div>
      </div>
    </div>

    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #718096;">
      This email was generated automatically by Dialkaraikudi contact form.
    </div>

  </div>
`;

    // Send email to admin
    // const transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    //   tls: {
    //     rejectUnauthorized: false,
    //   },
    // });

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in", // or smtp.zoho.com if you're using Zoho.com instead of Zoho.in
      port: 465, // or 587 for TLS (465 is for SSL)
      secure: true, // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // your Zoho email address
        pass: process.env.EMAIL_PASS, // your Zoho app-specific password
      },
    });

    await transporter.sendMail({
      from: `"Website Contact Form" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Submission${subject ? ` - ${subject}` : ""}`,
      html: mailHtml,
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (err) {
    console.error("Error in contactUs controller:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = { contactUs };
