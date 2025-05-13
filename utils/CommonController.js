const clearAuthCookies = require("../utils/clearAuthCookies");

exports.logout = () => {
  clearAuthCookies();
};
