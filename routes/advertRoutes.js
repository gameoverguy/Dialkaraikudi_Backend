const express = require("express");
const router = express.Router();
const advertController = require("../controllers/advertController"); // adjust path if needed
const { authenticateBusiness } = require("../middlewares/auth"); // if you have authentication

// Create a new advert (only for authenticated businesses)
router.post("/", authenticateBusiness, advertController.createAdvert);

// Get all ads by page (public route for frontend to load ads on pages like home, listing, etc.)
router.get("/adsbypage", advertController.getAdsByPage);

module.exports = router;
