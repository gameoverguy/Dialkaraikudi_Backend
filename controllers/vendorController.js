const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Vendor Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    console.log("test");

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor)
      return res.status(400).json({ message: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Signup successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (vendor.isBlocked)
      return res.status(403).json({ message: "Your account is blocked." });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    const token = jwt.sign(
      {
        vendorId: vendor._id,
        email: vendor.email,
        userType: "vendor",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        userType: "vendor",
        avatarUrl: vendor.avatarUrl || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    vendor.otp = { code: otp, expiresAt };
    await vendor.save();

    await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);

    res.status(200).json({ message: "OTP sent to your registered email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (!vendor.otp.code || !vendor.otp.expiresAt) {
      return res.status(400).json({ message: "No OTP request found." });
    }

    if (vendor.otp.expiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request again." });
    }

    if (vendor.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    res.status(200).json({
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (!vendor.otp.code) {
      return res
        .status(400)
        .json({ message: "OTP verification required before password reset." });
    }

    vendor.password = await bcrypt.hash(newPassword, 10);
    vendor.otp = { code: null, expiresAt: null };
    await vendor.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password -otp");
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Vendor
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select(
      "-password -otp"
    );
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Vendor
exports.updateVendor = async (req, res) => {
  try {
    const { name, phone, isBlocked } = req.body;

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    vendor.name = name ?? vendor.name;
    vendor.phone = phone ?? vendor.phone;
    vendor.isBlocked = isBlocked ?? vendor.isBlocked;

    await vendor.save();
    res.status(200).json({ message: "Vendor updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    res.status(200).json({ message: "Vendor deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
