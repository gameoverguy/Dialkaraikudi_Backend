const Business = require("../models/Business");
const Review = require("../models/Review");

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

// Get All Businesses with Owner + Category populated
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate("owner", "name email")
      .populate("category", "displayName iconUrl"); // ✨ populate category info

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
