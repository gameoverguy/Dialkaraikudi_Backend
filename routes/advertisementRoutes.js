const express = require("express");
const router = express.Router();
const AdvertisementController = require("../controllers/AdvertisementController");

// Home page advertisement slots
router.get("/slots/home", AdvertisementController.getHomeSlots);
router.post("/slots", AdvertisementController.createSlot);
router.put("/slots/:slotId", AdvertisementController.updateSlot);
router.delete("/slots/:slotId", AdvertisementController.deleteSlot);

module.exports = router;
