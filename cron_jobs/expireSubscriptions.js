const cron = require("node-cron");
const Subscription = require("../models/Subscription");

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

    // Update status to expired
    const expiredSubIds = expiredSubscriptions.map((sub) => sub._id);
    await Subscription.updateMany(
      { _id: { $in: expiredSubIds } },
      { $set: { status: "expired" } }
    );

    console.log(
      `✅ Marked ${expiredSubscriptions.length} subscriptions as expired`
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
