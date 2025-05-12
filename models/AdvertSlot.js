const mongoose = require("mongoose");

const advertSlotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "Home_Top_Banner", "ListingPage_Sidebar"
    page: {
      type: String,
      enum: ["home", "businesslisting", "businessdetails"], // add all used pages here
      required: true,
    },
    description: { type: String },
    slotType: { type: String, enum: ["Image", "Video"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdvertSlot", advertSlotSchema);
