// const mongoose = require("mongoose");

// const subscriptionSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       enum: ["Free", "Silver", "Gold", "Diamond", "Platinum"], // Restricts allowed names
//       required: true,
//       unique: true, // Ensures no duplicates in the DB — important if each name must be unique
//       default: "Free", // This must be one of the enum values (which it is)
//     },
//     price: { type: Number, required: true },
//     durationInDays: { type: Number, required: true },
//     features: [String],
//     isActive: { type: Boolean, default: true },
//     allowedSlots: [{ type: mongoose.Schema.Types.ObjectId, ref: "AdvertSlot" }],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Subscription", subscriptionSchema);
