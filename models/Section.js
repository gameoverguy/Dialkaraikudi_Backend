const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  images: [
    {
      url: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      sortOrder: { type: Number, default: 0 },
    },
  ],
  page: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Section", sectionSchema);
