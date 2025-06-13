const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    userType: {
      type: String,
      enum: ["business"],
      default: "business",
    },
    password: { type: String, required: true },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },

    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },

    isBlocked: { type: Boolean, default: false },
    logoUrl: { type: String },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    currentSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    contactDetails: {
      phone: { type: String },
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

    gst: { type: String },
    photos: [String],
    ratings: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    trustBadge: { type: Boolean, default: false },
    createdDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Business || mongoose.model("Business", businessSchema);
