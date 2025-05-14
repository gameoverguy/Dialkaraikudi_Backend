// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const CommonController = require("../utils/CommonController");
const verifyToken = require("../middleware/VerifyToken");

router.post("/logout", CommonController.logout);

// routes/auth.js or routes/user.js
router.get("/verifytoken", verifyToken, (req, res) => {
  res.status(200).json({ isTokenValid: true, message: "Token is valid" });
});

module.exports = router;
