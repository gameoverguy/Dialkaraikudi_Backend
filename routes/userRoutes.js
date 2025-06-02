// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const pendingUserController = require("../controllers/pendingUserController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

// used for google signup and signin
router.post("/googleauth", userController.googleAuth);
//used for regular login
router.post("/login", userController.loginUser);
//used for regular signup
router.post("/signup", pendingUserController.registerUser);
//used for verifying the otp received during the user signup process
router.post(
  "/verifyOtpAndCreateAccount",
  pendingUserController.verifyOtpAndCreateAccount
);
//used for resending the otp during the user signup process
router.post("/resendregisterotp", pendingUserController.resendOtp);
//used for sending otp during the user forgot password process
router.post("/forgotpassword", userController.forgotPassword);
//used for verifying the otp received during the forgot password process
router.post("/verifyotp", userController.verifyOtp);
//used for resetting password
router.post("/resetpassword", userController.resetPassword);
//used for getting all the users and their details
router.get("/", verifyToken, requireRole("admin"), userController.getAllUsers);
//used for getting the details of a specific user
router.get(
  "/:id",
  verifyToken,
  requireRole("user", "admin"),
  userController.getUserById
);
//used for updating the details of that particular user
router.put(
  "/:id",
  verifyToken,
  requireRole("user", "admin"),
  userController.updateUser
);
//used for deleting the user
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  userController.deleteUser
);

module.exports = router;
