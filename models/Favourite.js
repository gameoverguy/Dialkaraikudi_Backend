const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate favorites
favouriteSchema.index({ user: 1, business: 1 }, { unique: true });

module.exports = mongoose.model("Favourite", favouriteSchema);
