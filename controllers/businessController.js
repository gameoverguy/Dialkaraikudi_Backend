const Business = require("../models/Business");
const Review = require("../models/Review");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

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
        userType: "business",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      business: {
        id: business._id,
        name: business.name,
        email: business.email,
        phone: business.phone,
        userType: "business",
        avatarUrl: business.avatarUrl || null,
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

    await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);

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
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const business = await Business.findOne({ email });
    if (!business)
      return res.status(404).json({ message: "Business not found." });

    if (!business.otp.code) {
      return res
        .status(400)
        .json({ message: "OTP verification required before reset." });
    }

    business.password = await bcrypt.hash(newPassword, 10);
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

// Get All Businesses + Category populated
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate(
      "category",
      "displayName iconUrl"
    ); // ✨ populate category info

    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBusinessesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Use params instead of query
    const businesses = await Business.find({ category: categoryId }).populate(
      "category",
      "displayName iconUrl"
    );

    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Business by ID (WITH Reviews and User Info)
exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate(
      "category",
      "displayName iconUrl"
    );

    if (!business) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }

    // 🛠️ Get all reviews related to this business
    const reviews = await Review.find({ business: business._id })
      .populate("user", "name email") // populate user name and email
      .sort({ createdAt: -1 }); // latest reviews first

    res.status(200).json({
      success: true,
      data: {
        business,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }

    // 🛠️ Add new photos
    if (
      req.body.addPhotos &&
      Array.isArray(req.body.addPhotos) &&
      req.body.addPhotos.length > 0
    ) {
      business.photos = [...business.photos, ...req.body.addPhotos];
    }

    // 🛠️ Remove specific photos
    if (
      req.body.removePhotos &&
      Array.isArray(req.body.removePhotos) &&
      req.body.removePhotos.length > 0
    ) {
      business.photos = business.photos.filter(
        (photo) => !req.body.removePhotos.includes(photo)
      );
    }

    // 🛠️ Update other fields (except photos separately)
    Object.keys(req.body).forEach((key) => {
      if (key !== "addPhotos" && key !== "removePhotos") {
        business[key] = req.body[key];
      }
    });

    // 🛠️ Save changes
    const updated = await business.save();

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// Search Businesses by keyword using req.params
exports.searchBusinesses = async (req, res) => {
  try {
    const { keyword } = req.params;

    if (!keyword) {
      return res
        .status(400)
        .json({ success: false, message: "Keyword is required" });
    }

    const filter = {
      $or: [
        { businessName: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { "address.formattedAddress": { $regex: keyword, $options: "i" } },
      ],
    };

    const businesses = await Business.find(filter).populate(
      "category",
      "displayName iconUrl"
    );

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
