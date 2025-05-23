const cron = require("node-cron");
const Advert = require("../models/Advert");
const AdvertSlot = require("../models/AdvertSlot");

const disableExpiredAds = async () => {
  try {
    const now = new Date();

    // Find all active ads that have expired
    const expiredAds = await Advert.find({
      endDate: { $lte: now },
      isActive: true,
    });

    if (expiredAds.length === 0) {
      console.log("ℹ️ No expired ads found");
      return;
    }

    // Deactivate all expired ads
    const expiredAdIds = expiredAds.map((ad) => ad._id);
    await Advert.updateMany(
      { _id: { $in: expiredAdIds } },
      { $set: { isActive: false } }
    );

    // Remove corresponding businesses from allowedBusinesses in their slots
    for (const ad of expiredAds) {
      await AdvertSlot.updateOne(
        { _id: ad.slotId },
        { $pull: { allowedBusinesses: ad.businessId } }
      );
    }

    console.log(
      `✅ Deactivated ${expiredAds.length} expired ads and updated their slots`
    );
  } catch (err) {
    console.error("❌ Error disabling expired ads and updating slots:", err);
  }
};

// Run every hour (or change to any desired interval)
cron.schedule("14 17 * * *", disableExpiredAds, {
  timezone: "Asia/Kolkata",
});
