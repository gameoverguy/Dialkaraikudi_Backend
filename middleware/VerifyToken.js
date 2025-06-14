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

    const token = tokenFromHeader;

    console.log(token);

    if (!token) {
      return res
        .status(401)
        .json({ isTokenValid: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.userType === "user") {
      user = await User.findById(decoded.userId);
    } else if (decoded.userType === "business") {
      user = await Business.findById(decoded.businessId);
    } else if (decoded.userType === "admin") {
      user = await Admin.findById(decoded.adminId);
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", userdata: user });
    }

    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    CommonController.logout(req, res);
    return res
      .status(403)
      .json({ isTokenValid: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
