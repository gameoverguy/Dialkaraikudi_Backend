// models/User.js
const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ["user", "vendor"],
      default: "vendor",
    },
    avatarUrl: { type: String },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
