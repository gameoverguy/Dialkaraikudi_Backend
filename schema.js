address: {
  addressArea: String,
  city: String,
  state: String,
  pincode: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  placeId: String,  // Google Maps Place ID
  formattedAddress: String  // Full formatted address from Google
}, 
businessTimings: {
  monday: {
    isOpen: { type: Boolean, default: true },
    openTime: String,
    closeTime: String
  },
  tuesday: {
    isOpen: { type: Boolean, default: true },
    openTime: String,
    closeTime: String
  },
  wednesday: {
    isOpen: { type: Boolean, default: true },
    openTime: String,
    closeTime: String
  },
  thursday: {
    isOpen: { type: Boolean, default: true },
    openTime: String,
    closeTime: String
  },
  friday: {
    isOpen: { type: Boolean, default: true },
    openTime: String,
    closeTime: String
  },
  saturday: {
    isOpen: { type: Boolean, default: false },
    openTime: String,
    closeTime: String
  },
  sunday: {
    isOpen: { type: Boolean, default: false },
    openTime: String,
    closeTime: String
  }
}, 
owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Optional for admin-created businesses
claimStatus: {
  isClaimed: { type: Boolean, default: false },
  claimedAt: Date,
  claimRequest: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedAt: Date,
    documents: [String]  // Array of document URLs for verification
  }
},