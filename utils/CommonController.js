const clearAuthCookies = require("../utils/clearAuthCookies");

exports.logout = (req, res) => {
  try {
    clearAuthCookies(res); // Clears all tokens by default
    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
