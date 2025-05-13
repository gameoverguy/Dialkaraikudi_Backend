const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Business = require("../models/Business");
const Admin = require("../models/Admin");
const CommonController = require("../utils/CommonController");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token =
      req.cookies?.userToken ||
      req.cookies?.adminToken ||
      req.cookies?.businessToken ||
      tokenFromHeader;

    if (!token) {
      CommonController.logout();
      return res.status(401).json({ success: false, message: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.userType === "user") {
      user = await User.findById(decoded.userId);
    } else if (decoded.userType === "business") {
      user = await Business.findById(decoded.userId);
    } else if (decoded.userType === "admin") {
      user = await Admin.findById(decoded.userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    CommonController.logout();
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
