// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    // Logging Level
    level: {
      type: String,
      enum: ["info", "warn", "error", "debug"],
      default: "info",
    },

    // Human-readable message
    message: {
      type: String,
      required: true,
    },

    // Target of the action (what the log is about)
    model: { type: String }, // e.g., 'User', 'Business', 'Ad', 'Invoice'
    action: { type: String }, // e.g., 'create', 'update', 'delete', 'login'

    // Who performed the action
    actorType: {
      type: String,
      enum: ["User", "Admin", "Business", "System", "Unauthenticated"],
      default: "System",
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "actorType", // dynamically reference based on actorType
      default: null,
    },

    // Network context
    ip: { type: String },
    userAgent: { type: String },
    geo: {
      country: String,
      city: String,
      lat: Number,
      lon: Number,
    },

    // Custom payload
    meta: mongoose.Schema.Types.Mixed, // e.g. changed fields, input body, errors

    // Additional context (for dev tools / debugging)
    request: {
      url: String,
      method: String,
      headers: mongoose.Schema.Types.Mixed,
      body: mongoose.Schema.Types.Mixed,
      params: mongoose.Schema.Types.Mixed,
      query: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

logSchema.index({ actorType: 1, actorId: 1 });
logSchema.index({ model: 1, action: 1 });
logSchema.index({ level: 1 });
logSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
