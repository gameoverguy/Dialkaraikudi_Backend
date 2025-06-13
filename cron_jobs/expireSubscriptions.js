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
    await Subscription.updateMany(
      { _id: { $in: expiredSubIds } },
      { $set: { status: "expired" } }
    );

    // Clear currentSubscription in businesses pointing to these expired subs
    await Business.updateMany(
      { currentSubscription: { $in: expiredSubIds } },
      { $set: { currentSubscription: null } }
    );

    console.log(
      `✅ Marked ${expiredSubscriptions.length} subscriptions as expired and cleared related currentSubscription`
    );
  } catch (err) {
    console.error("❌ Error expiring subscriptions:", err);
  }
};

// Run daily at midnight
cron.schedule("0 0 * * *", disableExpiredSubscriptions, {
  timezone: "Asia/Kolkata",
});

module.exports = disableExpiredSubscriptions;
