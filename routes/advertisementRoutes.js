const express = require("express");
const router = express.Router();
const AdvertisementController = require("../controllers/AdvertisementController");

// Page routes
router.post("/pages", AdvertisementController.createPage);
router.get("/pages", AdvertisementController.getAllPages);

// Slot routes
router.get("/pages/:page/slots", AdvertisementController.getSlotsByPage);
router.post("/pages/:page/slots", AdvertisementController.upsertSlot);
router.delete("/pages/:page/slots/:slot", AdvertisementController.deleteSlot);

// Ad routes
router.post(
  "/pages/:page/slots/:slot/ads",
  AdvertisementController.addAdToSlot
);
router.put(
  "/pages/:page/slots/:slot/ads/:adId",
  AdvertisementController.updateAdInSlot
);
router.delete(
  "/pages/:page/slots/:slot/ads/:adId",
  AdvertisementController.deleteAdFromSlot
);

// Bulk operations routes
router.post(
  "/pages/:page/slots/:slot/bulkads",
  AdvertisementController.bulkAddAdsToSlot
);
router.delete(
  "/pages/:page/slots/:slot/bulkads",
  AdvertisementController.bulkDeleteAdsFromSlot
);

module.exports = router;
