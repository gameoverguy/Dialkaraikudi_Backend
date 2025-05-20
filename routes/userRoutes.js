// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const pendingUserController = require("../controllers/pendingUserController");

router.post("/login", userController.loginUser);

router.post("/signup", pendingUserController.registerUser);
router.post(
  "/verifyOtpAndCreateAccount",
  pendingUserController.verifyOtpAndCreateAccount
);

router.post("/resendregisterotp", pendingUserController.resendOtp);

router.post("/forgotpassword", userController.forgotPassword);
router.post("/verifyotp", userController.verifyOtp);
router.post("/resetpassword", userController.resetPassword);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
