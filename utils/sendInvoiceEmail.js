const nodemailer = require("nodemailer");

const sendInvoiceEmail = async (to, subject, mailContent, pdfBuffer) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // ✅ bypass self-signed cert errors
    },
  });

  // const htmlContent = `
  //   <div style="font-family: Arial, sans-serif; padding: 20px;">
  //     <h2>Thank you for your payment!</h2>
  //     <p>Please find your tax invoice attached.</p>
  //     <p>If you have any questions, reply to this email.</p>
  //     <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} Dialkaraikudi. All rights reserved.</p>
  //   </div>
  // `;

  await transporter.sendMail({
    from: `"Dialkaraikudi" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: mailContent,
    attachments: [
      {
        filename: "Invoice.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`✅ Invoice email sent to ${to}`);
};

module.exports = sendInvoiceEmail;
