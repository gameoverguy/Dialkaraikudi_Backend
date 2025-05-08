const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");

router.post("/", businessController.createBusiness);
router.post("/signup", businessController.businessSignup);
router.post("/login", businessController.login);
router.post("/forgotPassword", businessController.forgotPassword);
router.post("/verifyOtp", businessController.verifyOtp);
router.get("/", businessController.getAllBusinesses);
router.get("/:id", businessController.getBusinessById);
router.put("/:id", businessController.updateBusiness);
router.delete("/:id", businessController.deleteBusiness);
router.post("/bulkuploadbusiness", businessController.bulkUploadBusinesses);
router.get("/category/:categoryId", businessController.getBusinessesByCategory);
router.get("/search/:keyword", businessController.searchBusinesses);

module.exports = router;
