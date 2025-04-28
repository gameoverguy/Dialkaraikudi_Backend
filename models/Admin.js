// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: { type: String }, // optional

    password: { type: String, required: true }, // hashed password, always required for login

    role: {
      type: String,
      enum: ["superadmin", "moderator", "categorymanager"],
      default: "superadmin",
    },

    avatarUrl: { type: String }, // optional

    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },

    isBlocked: { type: Boolean, default: false }, // helpful if you need to block any admin account
  },
  { timestamps: true }
); // adds createdAt and updatedAt automatically

module.exports = mongoose.model("Admin", adminSchema);
