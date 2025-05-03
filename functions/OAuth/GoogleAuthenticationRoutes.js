// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../../functions/OAuth/GoogleAuthentication');

// POST /api/auth/google
router.post('/google', authController.googleLogin);

module.exports = router;
