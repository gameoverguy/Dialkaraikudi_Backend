const PendingUser = require("../models/PendingUser");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if already registered in User
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    // Check if already pending
    const existingPending = await PendingUser.findOne({ email });
    if (existingPending) await PendingUser.deleteOne({ email }); // clear old pending user

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const expiresAt = Date.now() + 5 * 60 * 1000;

    await PendingUser.create({
      name,
      email,
      phone,
      password: hashedPassword,
      userType: "user",
      otp: { code: otp, expiresAt },
    });

    await sendEmail(email, "Your OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtpAndCreateAccount = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser)
      return res.status(404).json({ message: "No pending signup found." });

    if (
      !pendingUser.otp ||
      pendingUser.otp.code !== otp ||
      pendingUser.otp.expiresAt < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Move to main User collection
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      password: pendingUser.password,
      userType: pendingUser.userType,
    });

    await PendingUser.deleteOne({ email });

    res.status(201).json({ message: "Account created successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res
        .status(404)
        .json({ message: "No pending signup found for this email." });
    }

    const now = Date.now();
    if (pendingUser.otp && pendingUser.otp.expiresAt > now) {
      const secondsLeft = Math.floor((pendingUser.otp.expiresAt - now) / 1000);
      return res.status(400).json({
        message: `Please wait ${secondsLeft} seconds before requesting a new OTP.`,
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    pendingUser.otp = { code: otp, expiresAt };
    await pendingUser.save();

    await sendEmail(email, "Your Verification OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP resent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
