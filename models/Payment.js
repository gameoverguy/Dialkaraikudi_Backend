const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    amount: Number, // Amount in INR
    currency: String,
    isVerified: { type: Boolean, default: false },

    // 🆕 Who purchased
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    businessName: String, // Optional but handy for reporting

    // 🆕 What was purchased
    type: { type: String, enum: ["slotPurchase", "subscriptionPurchase"] },
    itemId: mongoose.Schema.Types.ObjectId, // Slot or Plan ID
    itemName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
