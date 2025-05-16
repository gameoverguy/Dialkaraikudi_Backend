const mongoose = require("mongoose");

const advertSlotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    page: {
      type: String,
      enum: ["home", "businesslisting", "businessdetails"], // add all used pages here
      required: true,
    },
    adDurationInDays: {
      type: Number,
      default: 30,
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

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdvertSlot", advertSlotSchema);
