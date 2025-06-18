const Invoice = require("../models/Invoice");
const Counter = require("../models/Counter");
const sendInvoiceEmail = require("../utils/sendInvoiceEmail");
const html_to_pdf = require("html-pdf-node");

exports.generateAndSendInvoice = async (invoiceData) => {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const counterKey = `invoice-${yearSuffix}`;

  const counter = await Counter.findByIdAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const invoiceNo = `INVDK${yearSuffix}${(10000 + counter.seq).toString()}`;

  const {
    date,
    paidOn,
    billedTo,
    amount,
    cgst,
    sgst,
    total,
    email,
    itemName,
    itemDescription,
  } = invoiceData;

  const newInvoice = await Invoice.create({
    invoiceNo,
    date,
    paidOn,
    billedTo,
    amount,
    cgst,
    sgst,
    total,
    email,
    itemName,
    itemDescription,
  });

  const html = `<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        margin: 20px;
        background: #fff;
      }
      .container {
        width: 100%;
        max-width: 700px;
        margin: auto;
        border: 1px solid #ddd;
        padding: 20px 30px;
        border-radius: 6px;
        position: relative;
      }
      .logo {
        position: absolute;
        top: 20px;
        right: 30px;
        width: 100px; /* Adjust size as needed */
        height: auto;
      }
      .header {
        text-align: center;
        margin-bottom: 15px;
      }
      .header h2 {
        margin: 0;
        color: #333;
      }
      .header p {
        margin: 2px 0;
        font-size: 11px;
        color: #555;
      }
      .section {
        margin-bottom: 12px;
      }
      .section-title {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .section p {
        margin: 2px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }
      th, td {
        border: 1px solid #ccc;
        padding: 6px;
      }
      th {
        background: #f3f4f6;
        text-align: left;
      }
      .summary-table {
        margin-top: 10px;
      }
      .summary-table td {
        border: 1px solid #ccc;
        padding: 6px;
      }
      .summary-table .label {
        text-align: left;
      }
      .summary-table .value {
        text-align: right;
      }
      .summary-table .total-row {
        background: #f3f4f6;
        font-weight: bold;
        color: green;
      }
      .paid {
        text-align: right;
        font-size: 14px;
        color: green;
        font-weight: bold;
        margin-top: 12px;
      }
      .footer {
        text-align: center;
        font-size: 10px;
        color: #777;
        margin-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Company Logo -->
      <img class="logo" src="https://www.dialkaraikudi.com/assets/logo_01-DYIuitUZ.png" alt="Company Logo" />

      <div class="header">
        <h2>Tax Invoice (Paid)</h2>
      </div>

      <div class="section">
        <p><strong>Invoice No:</strong> ${invoiceNo}</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        <p><strong>Paid On:</strong> ${new Date(
          paidOn
        ).toLocaleDateString()}</p>
      </div>

      <div class="section" style="display: flex; justify-content: space-between; gap: 20px;">
  <div style="width: 50%;">
    <div class="section-title">From:</div>
    <p>SUNGLASSCHETTINAD RETAIL PRIVATE LIMITED</p>
    <p>20, KALANIVASAL AGRAGRAM,<br/>
    THIRUGANASAMBANTHAR STREET,<br/>
    Karaikkudi, Sivaganga,<br/>
    Tamil Nadu - 630002</p>
    <p>GSTIN: 33ABJCS2458R1ZN</p>
    <p>admin@dialkaraikudi.com</p>
  </div>

  <div style="width: 50%;">
    <div class="section-title">Billed To:</div>
    <p>${billedTo.name}</p>
    ${billedTo.address ? `<p>Address: ${billedTo.address}</p>` : ""}
    ${billedTo.gstin ? `<p>GSTIN: ${billedTo.gstin}</p>` : ""}
  </div>
</div>


      <table>
        <thead>
          <tr>
            <th style="width: 20%;">Item</th>
            <th style="width: 65%;">Description</th>
            <th style="width: 15%; text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${itemName}</td>
            <td>${itemDescription}</td>
            <td style="text-align: right;">${amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <table class="summary-table">
        <tr>
          <td class="label">Base Price</td>
          <td class="value">INR ${amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="label">CGST (9%)</td>
          <td class="value">INR ${cgst.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="label">SGST (9%)</td>
          <td class="value">INR ${sgst.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td class="label">
            Total Price
            <div style="font-size: 10px; font-weight: normal;">(incl. GST)</div>
          </td>
          <td class="value">INR ${total.toFixed(2)}</td>
        </tr>
      </table>

      <div class="paid">PAID</div>

      <div class="footer">
        This is a computer-generated tax invoice and does not require a signature.
      </div>
    </div>
  </body>
</html>
`; // your invoice HTML string here

  const mailContent = `<html>
  <body style="margin:0; padding:0; background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
      <tr>
        <td align="center" style="padding: 20px 10px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td bgcolor="#e6f3ff" style="padding: 20px; text-align: center;">
                <img src="https://www.dialkaraikudi.com/assets/logo_01-DYIuitUZ.png" width="120" alt="Dialkaraikudi" style="display: block; margin: auto;">
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <p style="margin-top:0;">Dear <strong>${
                  billedTo.name
                }</strong>,</p>
                <p>Thank you for your payment. Please find your tax invoice attached for your recent purchase from <strong style="color:#34495e;">Dialkaraikudi</strong>.</p>

                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
                  <tr>
                    <td style="padding: 8px 0; color:#555;">Invoice Number:</td>
                    <td style="padding: 8px 0; color:#333;"><strong>${invoiceNo}</strong></td>
                  </tr>
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 8px 0; color:#555;">Purchase Date:</td>
                    <td style="padding: 8px 0; color:#333;">${new Date(
                      date
                    ).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color:#555;">Paid On:</td>
                    <td style="padding: 8px 0; color:#333;">${new Date(
                      paidOn
                    ).toLocaleDateString()}</td>
                  </tr>
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 8px 0; color:#555;">Total Amount:</td>
                    <td style="padding: 8px 0; color:#333;">INR ${total.toFixed(
                      2
                    )} (incl. GST)</td>
                  </tr>
                </table>

                <p>Please keep this invoice for your records.</p>
                <p>If you have any questions, feel free to contact us at 
                  <a href="mailto:admin@dialkaraikudi.com" style="color:#e74c3c; text-decoration:none;">admin@dialkaraikudi.com</a>.
                </p>
                <p style="margin-bottom:0;">Thanks for choosing <strong style="color:#34495e;">Dialkaraikudi</strong>!</p>
                <p style="margin: 5px 0 0 0;">Best regards,<br><strong>Dialkaraikudi Team</strong></p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td bgcolor="#e6f3ff" style="height: 30px;"></td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const notificationMailContent = `<html>
  <body style="margin:0; padding:0; background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
      <tr>
        <td align="center" style="padding: 20px 10px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td bgcolor="#e6f3ff" style="padding: 20px; text-align: center;">
                <img src="https://www.dialkaraikudi.com/assets/logo_01-DYIuitUZ.png" width="120" alt="Dialkaraikudi" style="display: block; margin: auto;">
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <p style="margin-top:0;"><strong>Hi Admin,</strong></p>
                
                <p>We’re excited to let you know that a new purchase has been successfully completed from <strong style="color:#34495e;">Dialkaraikudi</strong>.</p>

                <p>Here are the details of your purchase:</p>

                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
                  <tr>
                    <td style="padding: 8px 0; color:#555;">Invoice Number:</td>
                    <td style="padding: 8px 0; color:#333;"><strong>${invoiceNo}</strong></td>
                  </tr>
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 8px 0; color:#555;">Purchase Date:</td>
                    <td style="padding: 8px 0; color:#333;">${new Date(
                      date
                    ).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color:#555;">Payment Received On:</td>
                    <td style="padding: 8px 0; color:#333;">${new Date(
                      paidOn
                    ).toLocaleDateString()}</td>
                  </tr>
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 8px 0; color:#555;">Amount Paid:</td>
                    <td style="padding: 8px 0; color:#333;">INR ${total.toFixed(
                      2
                    )} (incl. GST)</td>
                  </tr>
                </table>

                <p><strong>Item:</strong> ${itemName}</p>
                <p><strong>Description:</strong> ${itemDescription}</p>

                <p>You can find the attached invoice for your records.</p>

                <p style="margin: 5px 0 0 0;">Regards,<br><strong>The Dialkaraikudi Team</strong></p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td bgcolor="#e6f3ff" style="height: 30px;"></td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`;

  const mailSubject = `Your Dialkaraikudi Invoice [${invoiceNo}] — Payment Received`;
  const notificationMailSubject = `Purchase Notification: [${invoiceNo}] — Payment Received at Dialkaraikudi`;

  // const browser = await puppeteer.launch({
  //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
  //   ignoreHTTPSErrors: true,
  // });

  const file = { content: html };
  const options = {
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
    },
  };

  const pdfBuffer = await html_to_pdf.generatePdf(file, options);

  try {
    await sendInvoiceEmail(email, mailSubject, mailContent, pdfBuffer);
    await sendInvoiceEmail(
      process.env.ADMIN_EMAIL,
      notificationMailSubject,
      notificationMailContent,
      pdfBuffer,
      invoiceNo
    );
  } catch (err) {
    console.error("Error sending invoice email:", err);
  }

  return {
    success: true,
    message: "Invoice created and emailed",
    invoice: newInvoice,
  };
};
