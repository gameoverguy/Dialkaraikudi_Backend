const savedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
  type: { type: String, enum: ["saved", "favorite"], default: "saved" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Saved", savedSchema);
