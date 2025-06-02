const express = require("express");
const router = express.Router();
const advertSlotController = require("../controllers/advertSlotController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

// Create new advert slot
router.post(
  "/",
  verifyToken,
  requireRole("admin"),
  advertSlotController.createAdvertSlot
);

// Get all advert slots (with optional query filters)
router.get("/", advertSlotController.getAdvertSlots);

// Get a single advert slot by ID
router.get(
  "/:id",
  verifyToken,
  requireRole("admin"),
  advertSlotController.getAdvertSlotById
);

// Update an advert slot by ID
router.put(
  "/:id",
  verifyToken,
  requireRole("admin"),
  advertSlotController.updateAdvertSlot
);

// Delete an advert slot by ID
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  advertSlotController.deleteAdvertSlot
);

// Assign a business to an advert slot
router.post(
  "/assignbusiness",
  verifyToken,
  requireRole("business", "admin"),
  advertSlotController.assignBusinessToSlot
);

// Remove a business from an advert slot
router.post(
  "/removebusiness",
  verifyToken,
  requireRole("business", "admin"),
  advertSlotController.removeBusinessFromSlot
);

module.exports = router;
