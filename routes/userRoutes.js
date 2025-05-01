// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Login Route (common for both Users and Admins)
router.post("/login", userController.loginUser);
// User Signup
router.post("/signup", userController.signup);
// User Forgot Password
router.post("/forgotpassword", userController.forgotPassword);
// User Verify OTP
router.post("/verifyotp", userController.verifyOtp);
// User Reset Password
router.post("/resetpassword", userController.resetPassword);

// Admin-protected routes for user management
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
module.exports = router;
