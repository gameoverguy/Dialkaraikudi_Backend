// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

router.post("/login", adminController.loginAdmin);
// Admin Forgot Password
router.post("/forgotpassword", adminController.forgotPassword);
// Admin Verify OTP
router.post("/verifyotp", adminController.verifyOtp);
// Admin Reset Password
router.post("/resetpassword", adminController.resetPassword);

module.exports = router;
