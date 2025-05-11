const Advert = require("../models/Advert");
const Business = require("../models/Business");
const Subscription = require("../models/Subscription");
const AdvertSlot = require("../models/AdvertSlot");

exports.createAdvert = async (req, res) => {
  try {
    const businessId = req.user.id; // assuming JWT middleware sets req.user
    const { slotId, mediaUrl, type, priority, startDate, endDate } = req.body;

    // 1. Get the business and populate its subscription
    const business = await Business.findById(businessId).populate({
      path: "subscription.currentPlan",
      populate: {
        path: "allowedSlots",
        model: "AdvertSlot",
      },
    });

    if (
      !business ||
      !business.subscription ||
      !business.subscription.currentPlan
    ) {
      return res.status(403).json({ message: "No active subscription found." });
    }

    const subscription = business.subscription.currentPlan;

    // 2. Check if the slot is allowed
    const isSlotAllowed = subscription.allowedSlots.some(
      (slot) => slot._id.toString() === slotId
    );

    if (!isSlotAllowed) {
      return res
        .status(403)
        .json({ message: "Your subscription does not allow this slot." });
    }

    // 3. Create the advert
    const newAd = new Advert({
      business: businessId,
      slot: slotId,
      type,
      mediaUrl,
      priority: priority || 1,
      startDate,
      endDate,
    });

    await newAd.save();

    res.status(201).json({ message: "Ad created successfully", advert: newAd });
  } catch (err) {
    console.error("Error creating ad:", err);
    res.status(500).json({ message: "Server error" });
  }
};
