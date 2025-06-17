const express = require("express");
const router = express.Router();
const { createInvoiceAndSend } = require("../controllers/invoiceController");

router.post("/create-invoice", createInvoiceAndSend);

module.exports = router;
