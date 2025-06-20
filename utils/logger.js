// utils/logger.js
const Log = require("../models/Log");

exports.logEvent = async ({
  level = "info",
  message,
  model = null,
  action = null,
  actorType = "System",
  actorId = null,
  ip = null,
  userAgent = null,
  request = null,
  meta = {},
}) => {
  try {
    await Log.create({
      level,
      message,
      model,
      action,
      actorType,
      actorId,
      ip,
      userAgent,
      request,
      meta,
    });
  } catch (err) {
    console.error("Failed to log event:", err.message);
  }
};
