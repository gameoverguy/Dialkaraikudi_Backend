const express = require("express");
const router = express.Router();
const favouriteController = require("../controllers/favouriteController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

// Add or remove from favourites
router.post(
  "/add",
  verifyToken,
  requireRole("user"),
  favouriteController.addToFavourites
);
router.post(
  "/remove",
  verifyToken,
  requireRole("user"),
  favouriteController.removeFromFavourites
);

// Get all favourites of a user
router.get(
  "/user",
  verifyToken,
  requireRole("user"),
  favouriteController.getUserFavourites
);

// Check if a business is favourited by a user
router.get(
  "/check",
  verifyToken,
  requireRole("user"),
  favouriteController.isFavourited
);

module.exports = router;
