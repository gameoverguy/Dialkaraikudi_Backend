const express = require("express");
const router = express.Router();
const slotPurchaseController = require("../controllers/slotPurchaseController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

// Business purchases a slot, admin can do as well
router.post(
  "/",
  verifyToken,
  requireRole("business", "admin"),
  slotPurchaseController.purchaseSlot
);

// Admin gets all pending purchases
router.get(
  "/pending",
  verifyToken,
  requireRole("admin"),
  slotPurchaseController.getPendingSlotPurchases
);

// Admin marks purchase completed manually (if needed)
// router.patch("/complete", slotPurchaseController.markSlotPurchaseCompleted);

module.exports = router;
