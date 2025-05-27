const Business = require("../models/Business");
const SlotPurchase = require("../models/SlotPurchase");
const Favourite = require("../models/Favourite");
const Review = require("../models/Review");
const Category = require("../models/Category");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const {
  trackBusinessView,
  getBusinessViewsCount,
  getBusinessReviewStats,
} = require("./trackBusinessView");
const clearAuthCookies = require("../utils/clearAuthCookies");

// Business Signup (Simplified)
exports.businessSignup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the business already exists by email
    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash the password
    req.body.password = await bcrypt.hash(password, 10);

    // Create and save business
    const business = new Business(req.body);
    await business.save();

    res.status(201).json({ message: "Signup successful", data: business });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Business Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const business = await Business.findOne({ email });
    if (!business)
      return res.status(404).json({ message: "Business not found." });

    if (business.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked." });
    }

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      {
        businessId: business._id,
        email: business.email,
        userType: business.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "14d" }
    );

    clearAuthCookies(res);

    // ✅ Set token in cookie
    res.cookie("businessToken", token, {
      httpOnly: true,
      secure: true, // required for HTTPS
      sameSite: "None", // allows cross-site
      maxAge: 14 * 24 * 60 * 60 * 1000, // 21 days
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      business: {
        id: business._id,
        name: business.businessName,
        email: business.email,
        phone: business.contactDetails.phone,
        userType: business.userType,
        logoUrl: business.logoUrl || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password (Send OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    business.otp = { code: otp, expiresAt };
    await business.save();

    await sendEmail(email, "Your Business Password Reset OTP", otp);

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const business = await Business.findOne({ email });
    if (!business)
      return res.status(404).json({ message: "Business not found." });

    if (!business.otp.code || !business.otp.expiresAt) {
      return res.status(400).json({ message: "No OTP request found." });
    }

    if (business.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    if (business.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    res
      .status(200)
      .json({ message: "OTP verified. Proceed to reset password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword, otp } = req.body;

    if (!email || !newPassword || !confirmPassword || !otp) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(404).json({ message: "Business not found." });
    }

    // Validate OTP
    if (
      !business.otp.code ||
      business.otp.code !== otp ||
      business.otp.expiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Hash and update password
    business.password = await bcrypt.hash(newPassword, 10);

    // Clear OTP
    business.otp = { code: null, expiresAt: null };
    await business.save();

    res.status(200).json({ message: "Password has been reset." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Business
exports.createBusiness = async (req, res) => {
  try {
    const business = new Business(req.body);
    await business.save();
    res.status(201).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Verified Businesses + Category populated
exports.getAllBusinessesAdmin = async (req, res) => {
  try {
    const businesses = await Business.find().populate(
      "category",
      "displayName iconUrl"
    );

    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Verified Businesses + Category populated
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ verified: true }).populate(
      "category",
      "displayName iconUrl"
    );

    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBusinessesByCategory = async (req, res) => {
  try {
    const { id } = req.params; // Use params instead of query
    const businesses = await Business.find({
      category: id,
      verified: true,
    }).populate("category", "displayName iconUrl");

    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Business by ID (WITH Reviews and User Info)
exports.getBusinessById = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = req.cookies?.userToken || tokenFromHeader;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = decoded; // So req.user._id becomes available
    } catch (err) {}

    const { id } = req.params;

    // Fetch business with populated category
    const business = await Business.findById(id).populate(
      "category",
      "displayName iconUrl"
    );

    console.log("266", business);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Track the view: pass businessId, ip, userId (or null)

    const userId = req.user ? req.user.userId : null;
    const ipAddress = req.ip;

    console.log(ipAddress, userId);

    // This returns true if this is a unique view today (per IP or user)
    const isUniqueView = await trackBusinessView(id, ipAddress, userId);

    // Fetch reviews for the business with user info
    const reviews = await Review.find({ business: id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Return business, reviews, and the unique view flag
    res.status(200).json({
      success: true,
      data: {
        business,
        reviews,
        uniqueViewToday: isUniqueView,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Business by ID (WITH Reviews and User Info)
exports.getBusinessForPanelById = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = req.cookies?.userToken || tokenFromHeader;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = decoded; // So req.user._id becomes available
    } catch (err) {}

    const { id } = req.params;

    // Fetch business with populated category
    const business = await Business.findById(id).populate(
      "category",
      "displayName iconUrl"
    );

    console.log("266", business);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Fetch reviews for the business with user info
    const reviews = await Review.find({ business: id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Return business, reviews,
    res.status(200).json({
      success: true,
      data: {
        business,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Business (Partial Update - Any Field)
exports.updateBusiness = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedBusiness = await Business.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Validate updates
    });

    if (!updatedBusiness) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedBusiness,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message:
        error.message || "Something went wrong while updating the business.",
    });
  }
};

// Delete Business by ID
exports.deleteBusiness = async (req, res) => {
  try {
    const deleted = await Business.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Business deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchBusinesses = async (req, res) => {
  try {
    const { keyword } = req.params;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Keyword is required",
      });
    }

    // Find matching category IDs
    const matchingCategories = await Category.find({
      $or: [
        { categoryName: { $regex: keyword, $options: "i" } },
        { displayName: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("_id");

    const categoryIds = matchingCategories.map((cat) => cat._id);

    // Build filter (include verified)
    const filter = {
      verified: true,
      $or: [
        { businessName: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { "address.formattedAddress": { $regex: keyword, $options: "i" } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
      ],
    };

    const businesses = await Business.find(filter).populate("category");

    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkUploadBusinesses = async (req, res) => {
  try {
    const businesses = req.body;

    if (!Array.isArray(businesses)) {
      return res.status(400).json({
        success: false,
        message: "Data must be an array of businesses.",
      });
    }

    const results = {
      created: [],
      skipped: [],
      errors: [],
    };

    for (const b of businesses) {
      const { businessName, category } = b;

      if (!businessName || !category) {
        results.errors.push({
          businessName: businessName || "(missing)",
          message: "Missing required field: businessName or category",
        });
        continue;
      }

      try {
        // Optional: Check for duplicate business name within the same category (or based on logic you prefer)
        const existing = await Business.findOne({ businessName, category });
        if (existing) {
          results.skipped.push({
            businessName,
            message: "Business already exists in this category",
          });
          continue;
        }

        const newBusiness = await Business.create(b);
        results.created.push(newBusiness);
      } catch (err) {
        results.errors.push({
          businessName,
          message: err.message,
        });
      }
    }

    res.status(201).json({ success: true, result: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBusinessDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = id;

    // Get business info
    const business = await Business.findById(businessId)
      .select("-password -otp")
      .lean();

    if (!business)
      return res.status(404).json({ message: "Business not found" });

    // Count of users who favorited this business
    const favouriteCount = await Favourite.countDocuments({
      business: businessId,
    });

    // Reviews stats
    const reviews = await Review.find({ business: businessId }).populate(
      "user",
      "name"
    );
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(
            1
          )
        : 0;

    const latestReviews = reviews.slice(0, 3);

    const reviewStatsWeekly = await getBusinessReviewStats(
      businessId,
      "weekly"
    );
    const reviewStatsMonthly = await getBusinessReviewStats(
      businessId,
      "monthly"
    );
    const reviewStatsYearly = await getBusinessReviewStats(
      businessId,
      "yearly"
    );

    // const viewsweeklySummary = await getBusinessViewsCount(
    //   business._id,
    //   "weekly"
    // );
    // const viewsmonthlySummary = await getBusinessViewsCount(
    //   business._id,
    //   "monthly"
    // );
    // const viewsyearlySummary = await getBusinessViewsCount(
    //   business._id,
    //   "yearly"
    // );

    // const viewsAllTimeSummary = await getBusinessViewsCount(
    //   business._id,
    //   "alltime"
    // );

    const [weekly, monthly, yearly, alltime] = await Promise.all([
      getBusinessViewsCount(businessId, "weekly"),
      getBusinessViewsCount(businessId, "monthly"),
      getBusinessViewsCount(businessId, "yearly"),
      getBusinessViewsCount(businessId, "alltime"),
    ]);

    res.json({
      business,
      favourites: favouriteCount,
      reviews: {
        count: reviewCount,
        averageRating,
        latestReviews,
        reviewStatsWeekly,
        reviewStatsMonthly,
        reviewStatsYearly,
      },
      views: {
        weekly: {
          totalViews: weekly.totalViews,
          totalUniqueViews: weekly.totalUniqueViews,
          totalUniqueUsers: weekly.totalUniqueUsers,
          breakdown: weekly.breakdown, // Include daily breakdown
        },
        monthly: {
          totalViews: monthly.totalViews,
          totalUniqueViews: monthly.totalUniqueViews,
          totalUniqueUsers: monthly.totalUniqueUsers,
          breakdown: monthly.breakdown, // Include daily breakdown
        },
        yearly: {
          totalViews: yearly.totalViews,
          totalUniqueViews: yearly.totalUniqueViews,
          totalUniqueUsers: yearly.totalUniqueUsers,
          breakdown: yearly.breakdown, // Include monthly breakdown
        },
        alltime: {
          totalViews: alltime.totalViews,
          totalUniqueViews: alltime.totalUniqueViews,
          totalUniqueUsers: alltime.totalUniqueUsers,
          breakdown: alltime.breakdown, // This may be empty if not grouped
        },
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
