const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  }, // This will be shown to users (can be different from internal name)
  description: {
    type: String,
  },
  iconUrl: {
    type: String,
  }, // optional: small icon for frontend
  imageUrl: {
    type: String,
  },
  categoryType: { type: String, enum: ["product", "service"] },
  isActive: {
    type: Boolean,
    default: true,
  }, // can hide category without deleting
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Category", categorySchema);
