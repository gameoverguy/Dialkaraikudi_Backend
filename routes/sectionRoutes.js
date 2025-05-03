const express = require("express");
const router = express.Router();
const SectionController = require("../controllers/SectionController");

// Section management routes
router.post("/", SectionController.createSection);
router.get("/page/:page", SectionController.getSectionsByPage);
router.put("/:id/heading", SectionController.updateSectionHeading);
router.post("/:id/images", SectionController.addImages);
router.delete("/:id/images/:imageId", SectionController.removeImage);
router.delete("/:id", SectionController.deleteSection);

module.exports = router;
