const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
      enum: ["admin", "user"],
      default: "admin",
    },
    password: { type: String, required: true }, // hashed password, always required for login
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },

    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["superadmin", "moderator", "categorymanager"],
      default: "superadmin",
    },

    phone: { type: String }, // optional
    avatarUrl: { type: String }, // optional
    isBlocked: { type: Boolean, default: false }, // helpful if you need to block any admin account
  },
  { timestamps: true }
); // adds createdAt and updatedAt automatically

module.exports = mongoose.model("Admin", adminSchema);
