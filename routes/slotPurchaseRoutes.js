const express = require("express");
const router = express.Router();
const slotPurchaseController = require("../controllers/slotPurchaseController");

// 1. Business purchases a slot
router.post("/", slotPurchaseController.createSlotPurchase);

// 2. Admin: View all pending purchases (needing ads)
router.get("/pending", slotPurchaseController.getPendingSlotPurchases);

// 3. Business: View their own slot purchases
router.get(
  "/business/:businessId",
  slotPurchaseController.getBusinessSlotPurchases
);

module.exports = router;
