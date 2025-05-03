const mongoose = require("mongoose");

const adSlotSchema = new mongoose.Schema({
  heading: { type: String, default: "" },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const advertisementSchema = new mongoose.Schema({
  page: { type: String, required: true }, // e.g., "home", "listing", "details"
  slots: [adSlotSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
