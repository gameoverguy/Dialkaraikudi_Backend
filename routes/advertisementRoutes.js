const express = require("express");
const router = express.Router();
const adCtrl = require("../controllers/AdvertisementController");

router.get("/pages", adCtrl.getAllPages);
router.get("/:page", adCtrl.getSlotsByPage);
router.post("/:page/slot", adCtrl.createSlot);
router.put("/:page/slot/:slotId", adCtrl.updateSlot);
router.delete("/:page/slot/:slotId", adCtrl.deleteSlot);

router.post("/:page/slot/:slotId/media", adCtrl.addMediaToSlot);
router.put("/:page/slot/:slotId/media/:mediaId", adCtrl.updateMediaItem);
router.delete("/:page/slot/:slotId/media/:mediaId", adCtrl.deleteMediaItem);

module.exports = router;
