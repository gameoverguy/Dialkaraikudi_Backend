// routes/vendorRoutes.js
const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");

router.post("/signup", vendorController.signup);
router.post("/login", vendorController.login);
router.post("/forgotpassword", vendorController.forgotPassword);
router.post("/verifyotp", vendorController.verifyOtp);
router.post("/resetpassword", vendorController.resetPassword);
router.post("/bulkaddvendors", vendorController.bulkAddVendors);

router.get("/", vendorController.getAllVendors);
router.get("/:id", vendorController.getVendorById);
router.put("/:id", vendorController.updateVendor);
router.delete("/:id", vendorController.deleteVendor);

module.exports = router;
