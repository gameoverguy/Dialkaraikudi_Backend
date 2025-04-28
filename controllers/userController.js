const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// User Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      userType: "user",
    });

    res.status(201).json({ message: "Signup successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password - Step 1: Send OTP to Email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    user.otp = { code: otp, expiresAt };
    await user.save();

    await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);

    res.status(200).json({ message: "OTP sent to your registered email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP - Step 2
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({ message: "No OTP request found." });
    }

    if (user.otp.expiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request again." });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    res
      .status(200)
      .json({
        message: "OTP verified successfully. You can now reset your password.",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password - Step 3
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otp.code) {
      return res
        .status(400)
        .json({ message: "OTP verification required before password reset." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = { code: null, expiresAt: null }; // Clear OTP after password change
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
