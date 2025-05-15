const cron = require("node-cron");
const Advert = require("../models/Advert");

const disableExpiredAds = async () => {
  try {
    const now = new Date();
    await Advert.updateMany(
      { endDate: { $lte: now }, isActive: true },
      { $set: { isActive: false } }
    );
    console.log("✅ Expired ads deactivated");
  } catch (err) {
    console.error("❌ Error disabling expired ads:", err);
  }
};

// Run every hour
cron.schedule("0 0 * * *", disableExpiredAds);
