const express = require("express");
const router = express.Router();
const advertSlotController = require("../controllers/advertSlotController");

// Create new advert slot
router.post("/", advertSlotController.createAdvertSlot);

// Get all advert slots (with optional query filters)
router.get("/", advertSlotController.getAdvertSlots);

// Get a single advert slot by ID
router.get("/:id", advertSlotController.getAdvertSlotById);

// Update an advert slot by ID
router.put("/:id", advertSlotController.updateAdvertSlot);

// Delete an advert slot by ID
router.delete("/:id", advertSlotController.deleteAdvertSlot);

// Assign a business to an advert slot
router.post("/assignbusiness", advertSlotController.assignBusinessToSlot);

// Remove a business from an advert slot
router.post("/removebusiness", advertSlotController.removeBusinessFromSlot);

module.exports = router;
