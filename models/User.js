const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  userType: {
    type: String,
    enum: ["user", "business", "admin"],
    default: "user",
  },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
  otp: {
    code: String,
    expiresAt: Date,
  },
});

module.exports = mongoose.model("User", userSchema);
