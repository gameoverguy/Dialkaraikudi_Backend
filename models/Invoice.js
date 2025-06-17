const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  paidOn: { type: Date, required: true },
  billedTo: {
    name: String,
    address: String,
    gstin: String,
  },
  amount: { type: Number, required: true },
  cgst: { type: Number, required: true },
  sgst: { type: Number, required: true },
  total: { type: Number, required: true },
  email: { type: String, required: true },
  itemName: { type: String, required: true },
  itemDescription: { type: String, required: true },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
