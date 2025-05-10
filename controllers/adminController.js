// controllers/adminController.js

const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    if (admin.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }
    console.log("test");

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        userType: admin.userType,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.clearCookie("userToken");
    res.clearCookie("adminToken");
    res.clearCookie("businessToken");

    // ✅ Set token in cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: true, // required for HTTPS
      sameSite: "None", // allows cross-site
      maxAge: 5 * 60 * 1000, // 5 minute
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone || null,
        userType: admin.userType,
        role: admin.role,
        avatarUrl: admin.avatarUrl || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password - Step 1: Send OTP to Admin Email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    admin.otp = { code: otp, expiresAt };
    await admin.save();

    await sendEmail(email, "Admin Password Reset OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent to admin email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP - Step 2
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    if (!admin.otp.code || !admin.otp.expiresAt) {
      return res.status(400).json({ message: "No OTP request found." });
    }

    if (admin.otp.expiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request again." });
    }

    if (admin.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    res.status(200).json({
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

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    if (!admin.otp.code) {
      return res
        .status(400)
        .json({ message: "OTP verification required before password reset." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    admin.otp = { code: null, expiresAt: null }; // clear OTP after successful password change
    await admin.save();

    res.status(200).json({ message: "Admin password reset successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
