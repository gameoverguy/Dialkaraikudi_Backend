const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
      enum: ["user"],
      default: "user",
    },
    googleAccount: { type: Boolean, default: false },
    password: { type: String, required: false },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },

    name: { type: String, required: true, trim: true },

    phone: { type: String, required: false },
    avatarUrl: { type: String },
    isBlocked: { type: Boolean, default: false }, // to support block feature later
  },
  { timestamps: true }
); // automatically adds createdAt and updatedAt so you don't have to manually add createdAt.

module.exports = mongoose.model("User", userSchema);
