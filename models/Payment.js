// backend/models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    amount: Number,
    currency: String,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
