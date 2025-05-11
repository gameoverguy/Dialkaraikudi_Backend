const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["Free", "Silver", "Gold", "Diamond", "Platinum"],
      required: true,
      default: true,
    },
    price: { type: Number, required: true },
    durationInDays: { type: Number, required: true }, // e.g., 30 for monthly
    features: [String], // array of features this plan includes
    isActive: { type: Boolean, default: true },
    allowedSlots: [{ type: mongoose.Schema.Types.ObjectId, ref: "AdvertSlot" }], // for precise control
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
