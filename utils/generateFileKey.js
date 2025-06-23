const crypto = require("crypto");
const path = require("path");

/**
 * Generates a unique S3 key using a secure random string.
 * @param {string} originalName - The original filename (e.g., "logo.png")
 * @param {string} folder - Optional folder prefix for the key (e.g., "categories/icons")
 * @returns {string} - A unique S3 key, e.g., "categories/icons/5af2...b3.png"
 */
function generateUniqueFileKey(originalName) {
  const ext = path.extname(originalName);
  const randomStr = crypto.randomBytes(16).toString("hex");
  const key = `${randomStr}${ext}`;
  return key.replace(/^\/+/, ""); // ensure no leading slashes
}

module.exports = generateUniqueFileKey;
