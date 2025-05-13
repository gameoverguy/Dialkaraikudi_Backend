// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/VerifyToken");

app.get("/verifyToken", verifyToken, (req, res) => {
  res.json({ user: req.user, userType: req.userType });
});

module.exports = router;
