const express = require("express");
const router = express.Router();
const adController = require("../controllers/advertController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

// 1. Create Ad
router.post("/", verifyToken, requireRole("admin"), adController.createAd);

// 2. Get all Ads (with optional query filters like slotId, businessId)
router.get("/", adController.getAds);

// 3. Update Ad by ID
router.put("/:id", verifyToken, requireRole("admin"), adController.updateAd);

// 4. Delete Ad by ID
router.delete("/:id", verifyToken, requireRole("admin"), adController.deleteAd);

// 5. Toggle Ad active/inactive status
router.patch(
  "/toggle/:id",
  verifyToken,
  requireRole("admin"),
  adController.toggleAdStatus
);

module.exports = router;
