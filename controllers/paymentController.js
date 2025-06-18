// backend/controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const AdvertSlot = require("../models/AdvertSlot");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Business = require("../models/Business");

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
      baseAmount,
      cgstAmount,
      sgstAmount,
      amount,
      currency,
      // 🆕 New fields from frontend
      businessId,
      businessName,
      type, // "slotPurchase" or "subscriptionPurchase"
      itemId, // slotId or planId
      itemName, // slotName or planName
    } = req.body;

    const itemDescription = "";
    const email = "";

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "business not found" });
      email = business.email;
    }

    if (type === "slotPurchase") {
      const slot = await AdvertSlot.findById(itemId);
      if (!slot) return res.status(404).json({ message: "Slot not found" });
      itemDescription = slot.description;
    } else if (type === "subscriptionPurchase") {
      const plan = await SubscriptionPlan.findById(itemId);
      if (!plan) return res.status(404).json({ message: "Plan not found" });
      itemDescription = plan.description;
    }

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

    const invoiceData = {
      date: new Date(),
      paidOn: new Date(),
      billedTo: {
        name: businessName,
        address: business.formattedAddress,
        gstin: business.gst,
      },
      amount: baseAmount,
      cgst: cgstAmount,
      sgst: sgstAmount,
      total: amount,
      email,
      itemName,
      itemDescription,
    };

    await payment.save();

    await generateAndSendInvoice(invoiceData);

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
