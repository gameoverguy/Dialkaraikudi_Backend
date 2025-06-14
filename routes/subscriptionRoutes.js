// ------------------- routes/subscriptionRoutes.js -------------------
const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const planController = require("../controllers/subscriptionPlanController");

// Business endpoints
router.post("/subscribe", subscriptionController.subscribe);
router.post("/unsubscribe", subscriptionController.unsubscribe);
router.get(
  "/subscription/:businessId",
  subscriptionController.getBusinessSubscription
);

// Admin endpoints
router.post("/plans", planController.createPlan);
router.get("/plans", planController.getPlans);
router.put("/plans/:id", planController.updatePlan);
router.delete("/plans/:id", planController.deletePlan);

module.exports = router;
