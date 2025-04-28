// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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

    password: { type: String, required: true }, // password is required for user login

    userType: {
      type: String,
      enum: ["user", "business"],
      default: "user",
    },

    avatarUrl: { type: String }, // optional

    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },

    isBlocked: { type: Boolean, default: false }, // to support block feature later
  },
  { timestamps: true }
); // automatically adds createdAt and updatedAt
// so you don't have to manually add createdAt.

module.exports = mongoose.model("User", userSchema);
