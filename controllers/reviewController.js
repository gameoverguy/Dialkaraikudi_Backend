const Review = require("../models/Review");
const Business = require("../models/Business");

// ✅ Helper function to update business rating and review count
const updateBusinessRatings = async (businessId) => {
  const reviews = await Review.find({ business: businessId });

  const reviewCount = reviews.length;
  const avgRating =
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount || 0;

  await Business.findByIdAndUpdate(businessId, {
    ratings: avgRating.toFixed(1),
    reviewCount: reviewCount,
  });
};

// ✅ CREATE a review
exports.createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);

    // Update Business after creating review
    await updateBusinessRatings(review.business);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ GET all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("business", "businessName");
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ GET single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "name")
      .populate("business", "businessName");
    if (!review)
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ UPDATE review
exports.updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedReview)
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });

    // Update Business after updating review
    await updateBusinessRatings(updatedReview.business);

    res.status(200).json({ success: true, data: updatedReview });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ DELETE review
exports.deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);

    if (!deletedReview)
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });

    // Update Business after deleting review
    await updateBusinessRatings(deletedReview.business);

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ GET review by user and business
exports.getMyReview = async (req, res) => {
  try {
    const { user, business } = req.query;

    if (!user || !business) {
      return res
        .status(400)
        .json({ success: false, error: "User and Business ID required" });
    }

    const review = await Review.findOne({ user, business });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
