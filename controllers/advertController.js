const Advert = require("../models/Advert");
const Business = require("../models/Business");
const Subscription = require("../models/Subscription");
const AdvertSlot = require("../models/AdvertSlot");

exports.createAdvert = async (req, res) => {
  try {
    const { slotId, mediaUrl, type, priority, startDate, endDate, businessId } =
      req.body;

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

// Get all active ads grouped by slot for a specific page
exports.getAdsByPage = async (req, res) => {
  try {
    const { page } = req.query;

    if (!page) {
      return res
        .status(400)
        .json({ success: false, message: "Page is required" });
    }

    const slots = await AdvertSlot.find({ page, isActive: true });

    const slotIds = slots.map((s) => s._id);

    const today = new Date();

    const ads = await Advert.find({
      slot: { $in: slotIds },
      isActive: true,
      $or: [
        { startDate: { $lte: today }, endDate: { $gte: today } },
        { startDate: null, endDate: null },
      ],
    })
      .populate("slot")
      .populate("business", "name") // optional
      .sort({ priority: -1 });

    const grouped = {};
    ads.forEach((ad) => {
      const slotName = ad.slot.name;
      if (!grouped[slotName]) grouped[slotName] = [];
      grouped[slotName].push(ad);
    });

    res.status(200).json({ success: true, data: grouped });
  } catch (err) {
    console.error("Error getting ads by page:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
