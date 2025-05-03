const mongoose = require("mongoose");

const adItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "video", "html"],
    required: true,
  },
  mediaUrl: { type: String }, // for image or video
  htmlContent: { type: String }, // for html type
  link: { type: String }, // optional, ad click target
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const adSlotSchema = new mongoose.Schema({
  slot: { type: String, required: true }, // e.g., "topBanner"
  isSlider: { type: Boolean, default: false },
  ads: [adItemSchema],
});

const advertisementSchema = new mongoose.Schema({
  page: { type: String, required: true }, // e.g., "home", "listing", "details"
  slots: [adSlotSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
