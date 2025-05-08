const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for admin-created businesses

  businessName: { type: String, required: true },
  description: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  contactDetails: {
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    whatsapp: { type: String },
  },

  address: {
    addressArea: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    placeId: { type: String }, // Google Maps Place ID
    formattedAddress: { type: String }, // Full formatted address from Google
  },

  businessTimings: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String },
      closeTime: { type: String },
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String },
      closeTime: { type: String },
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String },
      closeTime: { type: String },
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String },
      closeTime: { type: String },
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String },
      closeTime: { type: String },
    },
    saturday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String },
      closeTime: { type: String },
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String },
      closeTime: { type: String },
    },
  },

  holidayDates: [Date],

  claimStatus: {
    isClaimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    claimRequest: {
      status: { type: String, enum: ["pending", "approved", "rejected"] },
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      requestedAt: { type: Date },
      documents: [String], // URLs of submitted verification docs
    },
  },
  GST: [String],

  photos: [String],
  ratings: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  trustBadge: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: true },
});

module.exports = mongoose.model("Business", businessSchema);
