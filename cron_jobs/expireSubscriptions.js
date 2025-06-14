const cron = require("node-cron");
const Subscription = require("../models/Subscription");
const Business = require("../models/Business");

const disableExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    // Find all active subscriptions that have expired
    const expiredSubscriptions = await Subscription.find({
      endDate: { $lte: now },
      status: "active",
    });

    if (expiredSubscriptions.length === 0) {
      console.log("ℹ️ No expired subscriptions found");
      return;
    }

    const expiredSubIds = expiredSubscriptions.map((sub) => sub._id);

    // Mark subscriptions as expired
    const subUpdateResult = await Subscription.updateMany(
      { _id: { $in: expiredSubIds } },
      { $set: { status: "expired" } }
    );

    // Clear currentSubscription and reset verified
    const bizUpdateResult = await Business.updateMany(
      { currentSubscription: { $in: expiredSubIds } },
      { $set: { currentSubscription: null, verified: false } }
    );

    console.log(
      `✅ Marked ${subUpdateResult.modifiedCount} subscriptions as expired`
    );
    console.log(
      `✅ Cleared currentSubscription for ${bizUpdateResult.modifiedCount} businesses`
    );
  } catch (err) {
    console.error("❌ Error expiring subscriptions:", err);
  }
};

// Run daily at midnight
cron.schedule(
  "0 0 * * *",
  () => {
    try {
      disableExpiredSubscriptions();
    } catch (err) {
      console.error("❌ Cron job failed to start:", err);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);

module.exports = disableExpiredSubscriptions;
