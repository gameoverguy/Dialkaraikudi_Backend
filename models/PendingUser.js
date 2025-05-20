const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    userType: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    password: { type: String, required: true }, // Hashed password
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },

    name: { type: String, required: true, trim: true },

    phone: { type: String, required: true },
    avatarUrl: { type: String },
    isBlocked: { type: Boolean, default: false }, // to support block feature later
  },
  { timestamps: true }
);

module.exports = mongoose.model("PendingUser", pendingUserSchema);
