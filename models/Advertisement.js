const mongoose = require("mongoose");

const adMedia = new mongoose.Schema({
  description: { type: String, default: "" },
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 1 },
});

const adSlotSchema = new mongoose.Schema({
  heading: { type: String, default: "" },
  type: {
    type: Number,
    enum: [1, 2, 3], // 1: static/HTML, 2: image slider, 3: video
    required: true,
  },
  interval: { type: Number, default: 5 }, // in seconds, for slider/video switch
  mediaItems: [mediaSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const advertisementSchema = new mongoose.Schema({
  page: { type: String, required: true }, // e.g., "home", "listing"
  slots: [adSlotSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
