const ContactMessage = require("../models/ContactMessage");
const nodemailer = require("nodemailer");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

const contactUs = async (req, res) => {
  try {
    const { name, email, phone, subject, message, reason } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({
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
      reason,
    });

    // Format email
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #007BFF;">New Contact Us Query</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p><strong>Reason:</strong> ${reason || "Other"}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f9f9f9; padding: 10px; border-radius: 6px;">
          ${message.replace(/\n/g, "<br/>")}
        </div>
        <hr/>
        <p style="font-size: 12px; color: #777;">This message was generated from your website's Contact Us form.</p>
      </div>
    `;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Website Contact Form" <${process.env.MAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Submission${subject ? ` - ${subject}` : ""}`,
      html: mailHtml,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Your message has been sent successfully!",
      });
  } catch (err) {
    console.error("Error in contactUs controller:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
  }
};

module.exports = { contactUs };
