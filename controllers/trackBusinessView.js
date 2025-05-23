const BusinessView = require("../models/BusinessView");
const moment = require("moment");

// Track each view and check if unique per day per user/IP
async function trackBusinessView(businessId, ipAddress, userId = null) {
  const today = moment().format("YYYY-MM-DD");

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

  // Save every view (refresh)
  await BusinessView.create({
    business: businessId,
    ipAddress,
    user: userId,
    date: today,
  });

  return !uniqueViewExists; // true if unique today
}

// Get views counts (total views, unique views, unique users) for a period
async function getBusinessViewsCount(businessId, period = "monthly") {
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
