const mongoose = require("mongoose");
const Business = require("../models/Business"); // Adjust path to your model
require("dotenv").config(); // Make sure .env has MONGO_URI

async function updateAllBusinesses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Example fields to update
    const updateFields = {
      "subscription.currentPlan": "0000000000",
    };

    const result = await Business.updateMany({}, { $set: updateFields });

    console.log(`✅ Updated ${result.modifiedCount} businesses successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating businesses:", error);
    process.exit(1);
  }
}

updateAllBusinesses();

//////////////////
