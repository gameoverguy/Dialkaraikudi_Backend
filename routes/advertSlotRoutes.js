const express = require("express");
const router = express.Router();
const advertSlotController = require("../controllers/advertSlotController");

router.post("/", advertSlotController.createAdvertSlot);
router.get("/", advertSlotController.getAllAdvertSlots);
router.put("/:id", advertSlotController.updateAdvertSlot);
router.delete("/:id", advertSlotController.deleteAdvertSlot);

module.exports = router;
