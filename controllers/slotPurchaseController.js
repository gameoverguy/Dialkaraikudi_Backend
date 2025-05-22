const SlotPurchase = require("../models/SlotPurchase");

// Business purchases a slot
exports.purchaseSlot = async (req, res) => {
  try {
    const { slotId, businessId } = req.body;

    const existing = await SlotPurchase.findOne({
      slotId,
      businessId,
      status: "pendingupload",
    });

    if (existing) {
      return res.status(400).json({
        message:
          "You have already purchased this slot and it's pending an ad upload.",
      });
    }

    const purchase = await SlotPurchase.create({ slotId, businessId });
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin fetches pending slot purchases
exports.getPendingSlotPurchases = async (req, res) => {
  try {
    const pending = await SlotPurchase.find({ status: "pendingupload" })
      .populate("slotId businessId")
      .sort({ purchasedAt: -1 });

    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin manually marks slot purchase as completed (if needed)
exports.markSlotPurchaseCompleted = async (req, res) => {
  try {
    const { purchaseId, adId } = req.body;

    const updated = await SlotPurchase.findByIdAndUpdate(
      purchaseId,
      { status: "completed", adId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Slot purchase not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
