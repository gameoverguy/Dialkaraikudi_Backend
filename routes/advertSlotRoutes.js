const express = require("express");
const router = express.Router();
const advertSlotController = require("../controllers/advertSlotController");

router.post("/", advertSlotController.createSlot);
router.get("/", advertSlotController.getAllSlots);
router.put("/:id", advertSlotController.updateSlot);
router.delete("/:id", advertSlotController.deleteSlot);

module.exports = router;
