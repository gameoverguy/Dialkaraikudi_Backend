const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Basic", "Standard", "Premium"],
    required: true,
  },
  price: { type: Number, required: true },
  durationInDays: { type: Number, required: true }, // e.g., 30 for monthly
  features: [String], // array of features this plan includes
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
