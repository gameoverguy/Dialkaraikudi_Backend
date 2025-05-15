const express = require("express");
const router = express.Router();
const favouriteController = require("../controllers/favouriteController");

// Add or remove from favourites
router.post("/add", favouriteController.addToFavourites);
router.post("/remove", favouriteController.removeFromFavourites);

// Get all favourites of a user
router.get("/user", favouriteController.getUserFavourites);

// Check if a business is favourited by a user
router.get("/check", favouriteController.isFavourited);

module.exports = router;
