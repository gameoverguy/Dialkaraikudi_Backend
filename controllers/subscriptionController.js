// ------------------- controllers/subscriptionController.js -------------------
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Business = require("../models/Business");

exports.subscribe = async (req, res) => {
  try {
    const { businessId, planId } = req.body;

    // Validate plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan)
      return res.status(404).json({ success: false, error: "Plan not found" });

    // Validate business
    const business = await Business.findById(businessId);
    if (!business)
      return res
        .status(404)
        .json({ success: false, error: "Business not found" });

    // Optionally, check if they already have an active subscription
    const existingActive = await Subscription.findOne({
      business: businessId,
      status: "active",
    });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        error: "Business already has an active subscription",
      });
    }

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    const subscription = await Subscription.create({
      business: businessId,
      plan: planId,
      startDate,
      endDate,
      status: "active",
    });

    // Update business's currentSubscription (if you're using that field)
    business.currentSubscription = subscription._id;
    await business.save();

    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    console.error("❌ Subscription error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBusinessSubscription = async (req, res) => {
  try {
    const { businessId } = req.params;
    const subscription = await Subscription.findOne({ business: businessId })
      .sort({ createdAt: -1 })
      .populate("plan");

    if (!subscription) {
      return res
        .status(404)
        .json({
          success: false,
          error: "No subscription found for this business",
        });
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
