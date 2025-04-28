// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin Forgot Password
router.post("/forgot-password", adminController.forgotPassword);

// Admin Verify OTP
router.post("/verify-otp", adminController.verifyOtp);

// Admin Reset Password
router.post("/reset-password", adminController.resetPassword);

module.exports = router;
