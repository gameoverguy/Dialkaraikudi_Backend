// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/VerifyToken");

router.get("/verifyToken", verifyToken, (req, res) => {
  res.json({ success: true, message: "Token works i guess !!" });
});

//router.post("/logout", Logout);

module.exports = router;
