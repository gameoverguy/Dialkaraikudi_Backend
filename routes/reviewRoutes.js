const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

//used for creating reviews in business by user
router.post(
  "/",
  verifyToken,
  requireRole("user"),
  reviewController.createReview
);
// used for getting the review by the user for that business
router.get(
  "/myreview",
  verifyToken,
  requireRole("user"),
  reviewController.getMyReview
);
// used to get all the reviews
router.get(
  "/",
  verifyToken,
  requireRole("admin"),
  reviewController.getAllReviews
);
// used to get a particular review
router.get(
  "/:id",
  verifyToken,
  requireRole("admin"),
  reviewController.getReviewById
);

router.put(
  "/:id",
  verifyToken,
  requireRole("user"),
  reviewController.updateReview
);
router.delete(
  "/:id",
  verifyToken,
  requireRole("user", "business", "admin"),
  reviewController.deleteReview
);

// Get all reviews for a business
router.get(
  "/business/:businessId",
  verifyToken,
  requireRole("business", "admin"),
  reviewController.getReviewsForBusiness
);

module.exports = router;
