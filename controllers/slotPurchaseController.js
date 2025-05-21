const SlotPurchase = require("../models/SlotPurchase");

// Create a new slot purchase
exports.createSlotPurchase = async (req, res) => {
  try {
    const { slotId, businessId } = req.body;

    const existing = await SlotPurchase.findOne({
      slotId,
      businessId,
      status: "pending",
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Slot already purchased and pending ad upload." });
    }

    const purchase = await SlotPurchase.create({ slotId, businessId });
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pending purchases (admin view)
exports.getPendingSlotPurchases = async (req, res) => {
  try {
    const pending = await SlotPurchase.find({ status: "pending" })
      .populate("slotId")
      .populate("businessId");
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all purchases for a specific business
exports.getBusinessSlotPurchases = async (req, res) => {
  try {
    const { businessId } = req.params;
    const purchases = await SlotPurchase.find({ businessId }).populate(
      "slotId adId"
    );
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark a purchase as completed when an ad is added
exports.markSlotPurchaseCompleted = async (slotId, businessId, adId) => {
  try {
    await SlotPurchase.findOneAndUpdate(
      { slotId, businessId, status: "pending" },
      { status: "completed", adId }
    );
  } catch (error) {
    console.error("Failed to mark slot purchase as completed:", error.message);
  }
};
