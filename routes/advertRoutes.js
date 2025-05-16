const express = require("express");
const router = express.Router();
const adController = require("../controllers/advertController");

// 1. Create Ad
router.post("/", adController.createAd);

// 2. Get all Ads (with optional query filters like slotId, businessId)
router.get("/", adController.getAds);

// 3. Update Ad by ID
router.put("/:id", adController.updateAd);

// 4. Delete Ad by ID
router.delete("/:id", adController.deleteAd);

// 5. Toggle Ad active/inactive status
router.patch("/toggle/:id", adController.toggleAdStatus);

module.exports = router;
