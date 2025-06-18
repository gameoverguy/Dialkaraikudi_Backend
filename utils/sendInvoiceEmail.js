const nodemailer = require("nodemailer");

const sendInvoiceEmail = async (
  to,
  subject,
  mailContent,
  pdfBuffer,
  invoiceNo
) => {
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

  await transporter.sendMail({
    from: `"Dialkaraikudi" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: mailContent,
    attachments: [
      {
        filename: `${invoiceNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};

module.exports = sendInvoiceEmail;
