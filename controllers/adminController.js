const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Business = require("../models/Business");
const Review = require("../models/Review");
const Category = require("../models/Category");
const AdvertSlot = require("../models/AdvertSlot");
const clearAuthCookies = require("../utils/clearAuthCookies");

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

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        userType: admin.userType,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    clearAuthCookies(res);

    // ✅ Set token in cookie
    // res.cookie("adminToken", token, {
    //   httpOnly: true,
    //   secure: true, // required for HTTPS
    //   sameSite: "None", // allows cross-site
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 21 days
    // });

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

const groupByTime = async (Model, dateField, startDate, groupFormat) => {
  return Model.aggregate([
    {
      $match: {
        [dateField]: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: groupFormat, date: `$${dateField}` },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

exports.getDashboardData = async (req, res) => {
  try {
    const [userCount, businessCount, categoriesCount, advertSlotsCount] =
      await Promise.all([
        User.countDocuments(),
        Business.countDocuments(),
        Category.countDocuments(),
        AdvertSlot.countDocuments(),
      ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    const recentBusinesses = await Business.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("businessName ownerName createdAt");

    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .populate("business", "businessName")
      .select("rating comment createdAt")
      .lean()
      .then((reviews) =>
        reviews.filter((review) => review.user && review.business)
      );

    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6); // last 7 days including today
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [weeklyUsers, weeklyBusinesses] = await Promise.all([
      groupByTime(User, "createdAt", startOfWeek, "%Y-%m-%d"),
      groupByTime(Business, "createdAt", startOfWeek, "%Y-%m-%d"),
    ]);

    const [monthlyUsers, monthlyBusinesses] = await Promise.all([
      groupByTime(User, "createdAt", startOfMonth, "%Y-%m-%d"),
      groupByTime(Business, "createdAt", startOfMonth, "%Y-%m-%d"),
    ]);

    const [yearlyUsers, yearlyBusinesses] = await Promise.all([
      groupByTime(User, "createdAt", startOfYear, "%Y-%m"),
      groupByTime(Business, "createdAt", startOfYear, "%Y-%m"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: userCount,
        totalBusinesses: businessCount,
        totalCategories: categoriesCount,
        totalAdvertSlots: advertSlotsCount,
        recentUsers,
        recentBusinesses,
        recentReviews,
        weekly: {
          users: weeklyUsers,
          businesses: weeklyBusinesses,
        },
        monthly: {
          users: monthlyUsers,
          businesses: monthlyBusinesses,
        },
        yearly: {
          users: yearlyUsers,
          businesses: yearlyBusinesses,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
