// scripts/createSuperadmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin"); // Adjust path as per your structure
require("dotenv").config(); // To load your .env (MongoDB URI)

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Admin.findOne({ email: "karthick251087@gmail.com" });
    if (existing) {
      console.log("Superadmin already exists.");
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("supersecurepassword", 10);

    const admin = new Admin({
      name: "Super Admin",
      email: "karthick251087@gmail.com",
      phone: "9043814241",
      password: hashedPassword,
      role: "superadmin",
      avatarUrl: "", // Optional
    });

    await admin.save();
    console.log("✅ Superadmin created successfully.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createSuperAdmin();
