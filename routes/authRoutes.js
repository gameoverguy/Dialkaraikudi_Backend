// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login Route (common for both Users and Admins)
router.post("/login", authController.login);

module.exports = router;
