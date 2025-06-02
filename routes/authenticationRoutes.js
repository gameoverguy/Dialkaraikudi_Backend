// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const CommonController = require("../utils/CommonController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

router.post(
  "/logout",
  verifyToken,
  requireRole("user", "business", "admin"),
  CommonController.logout
);

// routes/auth.js or routes/user.js
router.get("/verifytoken", verifyToken, (req, res) => {
  res.status(200).json({
    isTokenValid: true,
    userType: req.userType,
    message: "Token is valid",
  });
});

module.exports = router;
