const cron = require("node-cron");
const Business = require("../models/Business");

const deactivateExpiredSubscriptions = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const result = await Business.updateMany(
        {
          "subscription.expiresAt": { $lte: now },
          "subscription.isActive": true,
        },
        {
          $set: { "subscription.isActive": false },
        }
      );
      console.log(
        `[CRON] Deactivated ${result.modifiedCount} expired subscriptions`
      );
    } catch (error) {
      console.error(
        "[CRON] Failed to deactivate expired subscriptions:",
        error.message
      );
    }
  });
};

module.exports = deactivateExpiredSubscriptions;
