const mongoose = require("mongoose");

const slotPurchaseSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdvertSlot",
      required: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    adId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advert",
      default: null,
    },
    status: {
      type: String,
      enum: ["pendingupload", "completed"],
      default: "pending",
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SlotPurchase ||
  mongoose.model("SlotPurchase", slotPurchaseSchema);
