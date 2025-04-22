const businessSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  businessName: String,
  description: String,
  category: String,
  contactDetails: {
    phone: String,
    email: String,
    website: String,
    whatsapp: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  workingHours: {
    type: Map,
    of: {
      isOpen: Boolean,
      openTime: String,
      closeTime: String,
    },
  },
  holidayDates: [Date],
  overrideHours: {
    type: Map,
    of: {
      isOpen: Boolean,
      openTime: String,
      closeTime: String,
    },
  },
  photos: [String],
  ratings: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  verified: Boolean,
  trustBadge: Boolean,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Business", businessSchema);
