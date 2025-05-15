const mongoose = require("mongoose");

const advertSlotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    page: {
      type: String,
      enum: ["home", "businesslisting", "businessdetails"], // add all used pages here
      required: true,
    },
    slotType: { type: String, enum: ["Image", "Video"], required: true },
    allowedBusinesses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
      },
    ],
    maxAds: {
      type: Number,
      default: 10,
    },
    interval: {
      type: Number,
      default: 5000, // in ms, used for image sliders
    },

    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdvertSlot", advertSlotSchema);
