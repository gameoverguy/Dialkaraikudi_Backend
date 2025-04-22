const subscriptionSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
  planName: String,
  amount: Number,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ["active", "expired"], default: "active" },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
