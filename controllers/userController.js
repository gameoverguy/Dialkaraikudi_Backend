const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, phone });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.userType === "admin")
    return res.status(404).json({ message: "User not found or not eligible" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  user.otp = { code: otp, expiresAt };
  await user.save();

  await transporter.sendMail({
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  });

  res.json({ message: "OTP sent" });
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.otp)
    return res.status(404).json({ message: "Invalid user or OTP" });
  if (user.otp.expiresAt < Date.now())
    return res.status(400).json({ message: "OTP expired" });
  if (user.otp.code !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  user.otp = undefined;
  await user.save();

  const token = generateToken(user);
  res
    .cookie("token", token, { httpOnly: true })
    .json({ message: "Login successful", token });
};

exports.adminRegister = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Admin already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name,
    email,
    password: hashed,
    userType: "admin",
  });

  res.status(201).json(admin);
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email });

  if (!admin || admin.userType !== "admin")
    return res.status(404).json({ message: "Admin not found" });
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

  const token = generateToken(admin);
  res
    .cookie("token", token, { httpOnly: true })
    .json({ message: "Login successful", token });
};

exports.logout = (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
};
