// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const pendingUserController = require("../controllers/pendingUserController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

router.post("/googleauth", userController.googleAuth);
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
router.get("/", verifyToken, requireRole("admin"), userController.getAllUsers);
router.get(
  "/:id",
  verifyToken,
  requireRole("user", "admin"),
  userController.getUserById
);
router.put(
  "/:id",
  verifyToken,
  requireRole("user", "admin"),
  userController.updateUser
);
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  userController.deleteUser
);

module.exports = router;
