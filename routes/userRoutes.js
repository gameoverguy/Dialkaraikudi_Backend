const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);
router.post("/send-otp", userController.sendOTP);
router.post("/verify-otp", userController.verifyOTP);

router.post("/admin/register", userController.adminRegister);
router.post("/admin/login", userController.adminLogin);

router.post("/logout", userController.logout);

module.exports = router;
