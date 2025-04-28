// === middleware/admin.js ===
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.userType !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = adminOnly;
