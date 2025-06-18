const cron = require("node-cron");
const FeedPost = require("../models/FeedPost");

const expireOldFeedPosts = async () => {
  try {
    const now = new Date();
    const expiryDate = new Date(now.setDate(now.getDate() - 30));

    const result = await FeedPost.updateMany(
      {
        createdAt: { $lt: expiryDate },
        isExpired: false,
      },
      { $set: { isExpired: true } }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[CRON] Expired ${result.modifiedCount} feed posts older than 30 days`
      );
    } else {
      console.log("[CRON] No expired posts found today");
    }
  } catch (err) {
    console.error("[CRON] Error expiring old feed posts:", err.message);
  }
};

// 🕛 Schedule it
cron.schedule("0 0 * * *", expireOldFeedPosts, {
  timezone: "Asia/Kolkata",
});
