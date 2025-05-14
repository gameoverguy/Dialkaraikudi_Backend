// utils/CommonController.js
const clearAuthCookies = require("./clearAuthCookies");

exports.logout = (req, res) => {
  try {
    clearAuthCookies(res); // Only clears cookies
  } catch (error) {
    console.error("Logout error:", error.message);
  }
};
