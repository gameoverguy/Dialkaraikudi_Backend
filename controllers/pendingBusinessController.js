const PendingBusiness = require("../models/PendingBusiness");
const Business = require("../models/Business");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// 1. Request OTP for Business Signup
exports.registerBusiness = async (req, res) => {
  try {
    const email = req.body.email;

    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const existingPending = await PendingBusiness.findOne({ email });
    if (existingPending) {
      await PendingBusiness.deleteOne({ email });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 2 * 60 * 1000;

    await PendingBusiness.create({
      ...req.body,
      password: hashedPassword,
      otp: { code: otp, expiresAt },
    });

    await sendEmail(email, "Business OTP Verification", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Verify OTP and create real Business
exports.verifyOtpAndCreateBusiness = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;

    console.log(email);

    const pending = await PendingBusiness.findOne({ email });
    if (!pending) {
      console.log(email);
      return res
        .status(404)
        .json({ message: "No pending signup found.", req: req.body });
    }

    if (
      !pending.otp ||
      pending.otp.code !== otp ||
      pending.otp.expiresAt < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const businessData = {
      email: pending.email,
      userType: "business",
      password: pending.password,
      businessName: pending.businessName,
      ownerName: pending.ownerName,
      logoUrl: pending.logoUrl,
      description: pending.description,
      category: pending.category,
      contactDetails: pending.contactDetails,
      address: pending.address,
      businessTimings: pending.businessTimings,
      holidayDates: pending.holidayDates,
      GST: pending.GST,
      photos: pending.photos,
    };

    await Business.create(businessData);
    await PendingBusiness.deleteOne({ email });

    res.status(201).json({ message: "Business account created successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Resend OTP
exports.resendBusinessOtp = async (req, res) => {
  try {
    const email = req.body.email;

    const pending = await PendingBusiness.findOne({ email });
    if (!pending) {
      return res.status(404).json({ message: "No pending business found." });
    }

    const now = Date.now();
    if (pending.otp && pending.otp.expiresAt > now) {
      const secondsLeft = Math.floor((pending.otp.expiresAt - now) / 1000);
      return res.status(400).json({
        message: `Please wait ${secondsLeft} seconds before requesting a new OTP.`,
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 2 * 60 * 1000;

    pending.otp = { code: otp, expiresAt };
    await pending.save();

    await sendEmail(email, "Resent Business OTP", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "OTP resent to email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
