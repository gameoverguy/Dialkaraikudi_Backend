// controllers/invoiceController.js
const { generateAndSendInvoice } = require("../functions/invoiceGenerator");

exports.createInvoiceAndSend = async (req, res) => {
  try {
    const result = await generateAndSendInvoice(req.body);
    res.json(result);
  } catch (err) {
    console.error("❌ Error creating invoice:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create/send invoice" });
  }
};
