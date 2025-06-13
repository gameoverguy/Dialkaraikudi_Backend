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

    const expiredAdIds = expiredAds.map((ad) => ad._id);

    // DELETE expired ads
    await Advert.deleteMany({ _id: { $in: expiredAdIds } });

    // Remove corresponding businesses from allowedBusinesses in their slots
    for (const ad of expiredAds) {
      await AdvertSlot.updateOne(
        { _id: ad.slotId },
        { $pull: { allowedBusinesses: ad.businessId } }
      );
    }

    console.log(
      `✅ Deleted ${expiredAds.length} expired ads and updated their slots`
    );
  } catch (err) {
    console.error("❌ Error deleting expired ads and updating slots:", err);
  }
};

// Run every day at midnight (or adjust as needed)
cron.schedule("0 0 * * *", disableExpiredAds, {
  timezone: "Asia/Kolkata",
});
