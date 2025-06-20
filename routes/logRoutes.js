// routes/logRoutes.js
const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");

// Protect these routes for Admin only
// router.use(adminAuthMiddleware);

router.get("/", logController.getLogs);
router.get("/:id", logController.getLogById);
router.delete("/:id", logController.deleteLog);
router.delete("/", logController.deleteOldLogs);

module.exports = router;
