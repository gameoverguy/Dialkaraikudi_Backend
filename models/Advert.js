// models/Ad.js
const advertSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdvertSlot",
    required: true,
  },
  mediaUrl: { type: String },
  priority: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
});
