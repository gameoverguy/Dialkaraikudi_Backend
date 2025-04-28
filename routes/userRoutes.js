// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User Signup
router.post("/signup", userController.signup);

// User Forgot Password
router.post("/forgot-password", userController.forgotPassword);

// User Verify OTP
router.post("/verify-otp", userController.verifyOtp);

// User Reset Password
router.post("/reset-password", userController.resetPassword);

module.exports = router;
