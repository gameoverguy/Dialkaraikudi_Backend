// middlewares/requireRole.js
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userType)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient privileges." });
    }
    next();
  };
};

module.exports = requireRole;
