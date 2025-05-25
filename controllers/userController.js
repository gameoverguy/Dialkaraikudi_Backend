const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const client = require("../utils/googleClient"); // new import

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isBlocked)
      return res.status(403).json({ message: "Your account is blocked." });

    if (user && user.googleAccount && !user.password) {
      return res.status(400).json({
        message: "You registered with Google. Please login using Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "21d" }
    );

    res.clearCookie("userToken");
    res.clearCookie("adminToken");
    res.clearCookie("businessToken");

    // ✅ Set token in cookie
    res.cookie("userToken", token, {
      httpOnly: true,
      secure: true, // required for HTTPS
      sameSite: "None", // allows cross-site
      maxAge: 21 * 24 * 60 * 60 * 1000, // 21 days
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log(payload);
    const { email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({ message: "Invalid Google account" });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleAccount: true,
        phone: "",
        avatarUrl: picture,
        userType: "user",
        password: "", // empty for OAuth users
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "21d" }
    );

    res.clearCookie("userToken");
    res.clearCookie("adminToken");
    res.clearCookie("businessToken");

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 21 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (error) {
    console.error("Google Auth Error", error);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};

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
    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes validity

    user.otp = { code: otp, expiresAt };
    await user.save();

    await sendEmail(email, "Your User Password Reset OTP", otp);

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

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, userType, isBlocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.userType = userType ?? user.userType;
    user.isBlocked = isBlocked ?? user.isBlocked;

    await user.save();
    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
