const BusinessView = require("../models/BusinessView");
const moment = require("moment");

// Track each view and check if unique per day per user/IP
async function trackBusinessView(businessId, ipAddress, userId) {
  const today = moment().format("YYYY-MM-DD");
  const now = new Date();

  // Prevent duplicate logs from accidental rapid double requests (within 5 seconds)
  const recentView = await BusinessView.findOne({
    business: businessId,
    ipAddress,
    user: userId,
    date: today,
    createdAt: { $gte: new Date(now.getTime() - 5000) }, // last 5 seconds
  });

  if (recentView) {
    return false; // don’t track again this quickly
  }

  // Check if unique today
  let uniqueViewExists;

  if (userId) {
    uniqueViewExists = await BusinessView.findOne({
      business: businessId,
      user: userId,
      date: today,
    });
  } else {
    uniqueViewExists = await BusinessView.findOne({
      business: businessId,
      user: null,
      ipAddress,
      date: today,
    });
  }

  // Save view
  await BusinessView.create({
    business: businessId,
    ipAddress,
    user: userId,
    date: today,
  });

  return !uniqueViewExists;
}

// Get views counts (total views, unique views, unique users) for a period
async function getBusinessViewsCount(businessId, period) {
  let startDate;
  const endDate = moment().format("YYYY-MM-DD");

  if (period === "weekly") {
    startDate = moment().subtract(7, "days").format("YYYY-MM-DD");
  } else if (period === "monthly") {
    startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
  } else if (period === "yearly") {
    startDate = moment().subtract(365, "days").format("YYYY-MM-DD");
  } else {
    throw new Error("Invalid period specified");
  }

  // Filter documents in date range
  const views = await BusinessView.find({
    business: businessId,
    date: { $gte: startDate, $lte: endDate },
  });

  const totalViews = views.length;

  // Unique views per day by (user or IP)
  // Use a Set of `date-user/ip` combos to get unique views
  const uniqueViewKeys = new Set();
  const uniqueUsersSet = new Set();

  views.forEach((v) => {
    const key = v.user
      ? `${v.date}-user-${v.user.toString()}`
      : `${v.date}-ip-${v.ipAddress}`;
    uniqueViewKeys.add(key);
    if (v.user) uniqueUsersSet.add(v.user.toString());
  });

  return {
    totalViews,
    totalUniqueViews: uniqueViewKeys.size,
    totalUniqueUsers: uniqueUsersSet.size,
    startDate,
    endDate,
    period,
  };
}

module.exports = {
  trackBusinessView,
  getBusinessViewsCount,
};
