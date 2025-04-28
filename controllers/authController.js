const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials." });

      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "21d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 21 * 24 * 60 * 60 * 1000,
      });
      return res
        .status(200)
        .json({ message: "Admin login successful.", token, type: "admin" });
    }

    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials." });

      const token = jwt.sign(
        { id: user._id, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: "21d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 21 * 24 * 60 * 60 * 1000,
      });
      return res
        .status(200)
        .json({ message: "User login successful.", token, type: "user" });
    }

    res.status(404).json({ message: "Email not found." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
