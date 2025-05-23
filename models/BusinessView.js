const mongoose = require("mongoose");

const businessViewSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    ipAddress: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // optional registered user
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessView", businessViewSchema);
