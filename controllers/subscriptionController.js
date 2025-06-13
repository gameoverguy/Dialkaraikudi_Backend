// ------------------- controllers/subscriptionController.js -------------------
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan.");
const Business = require("../models/Business");

exports.subscribe = async (req, res) => {
  try {
    const { businessId, planId } = req.body;
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan)
      return res.status(404).json({ success: false, error: "Plan not found" });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    const subscription = await Subscription.create({
      business: businessId,
      plan: planId,
      startDate,
      endDate,
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBusinessSubscription = async (req, res) => {
  try {
    const { businessId } = req.params;
    const subscription = await Subscription.findOne({ business: businessId })
      .sort({ createdAt: -1 })
      .populate("plan");

    res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
