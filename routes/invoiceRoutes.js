const express = require("express");
const router = express.Router();
const { createInvoiceAndSend } = require("../controllers/invoiceController");
const { uploadImage } = require("../utils/UploadToS3");
const { upload } = require("../middleware/upload");

router.post("/create-invoice", createInvoiceAndSend);

router.post("/uploadtos3", upload.single("file"), uploadImage);

module.exports = router;
