const Subscription = require("../models/Subscription");
let indexesInitialized = false;

// Create a new subscription plan
exports.createSubscription = async (req, res) => {
  try {
    // Ensure indexes (like `unique`) are created once
    if (!indexesInitialized) {
      await Subscription.init();
      indexesInitialized = true;
    }

    // Prevent duplicate name manually (in case index isn't enforced yet)
    const existing = await Subscription.findOne({ name: req.body.name });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Subscription name already exists" });
    }

    const subscription = await Subscription.create(req.body);
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate("allowedSlots");
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate(
      "allowedSlots"
    );
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, error: "Subscription not found" });
    }
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update subscription by ID
exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("allowedSlots");

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, error: "Subscription not found" });
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete subscription by ID
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, error: "Subscription not found" });
    }
    res.status(200).json({ success: true, message: "Subscription deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
