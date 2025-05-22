const express = require("express");
const router = express.Router();
const slotPurchaseController = require("../controllers/slotPurchaseController");

// Business purchases a slot
router.post("/", slotPurchaseController.purchaseSlot);

// Admin gets all pending purchases
router.get("/pending", slotPurchaseController.getPendingSlotPurchases);

// Admin marks purchase completed manually (if needed)
router.patch("/complete", slotPurchaseController.markSlotPurchaseCompleted);

module.exports = router;
