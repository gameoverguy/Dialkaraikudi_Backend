const mongoose = require("mongoose");

const feedPostSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    likes: [
      {
        _id: false, // 🚫 prevent auto-generation of _id
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "likes.userType",
          required: true,
        },
        userType: { type: String, enum: ["User", "Business"], required: true },
      },
    ],

    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedPost", feedPostSchema);
