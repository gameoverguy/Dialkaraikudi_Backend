const mongoose = require("mongoose");

const adSlotSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Home_Top_Banner", "ListingPage_Sidebar"
  page: { type: String, required: true }, // e.g., "Home", "ListingPage"
  description: { type: String },
  slotType: { type: String, enum: ["Image", "Video"], required: true },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("AdSlot", adSlotSchema);
