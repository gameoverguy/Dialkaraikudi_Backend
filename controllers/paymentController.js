// backend/controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency,

      // 🆕 New fields from frontend
      businessId,
      businessName,
      type, // "slotPurchase" or "subscriptionPurchase"
      itemId, // slotId or planId
      itemName, // slotName or planName
    } = req.body;

    // Signature verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    const isVerified = expectedSignature === razorpay_signature;

    // Save payment with all details
    const payment = new Payment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency,
      isVerified,

      businessId,
      businessName,
      type,
      itemId,
      itemName,
    });

    await payment.save();

    res.status(200).json({
      message: isVerified ? "Payment verified" : "Invalid signature",
      success: isVerified,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Verification failed", error: err });
  }
};
