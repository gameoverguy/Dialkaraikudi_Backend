const BusinessView = require("../models/BusinessView");
const Review = require("../models/Review");
const mongoose = require("mongoose");
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
// async function getBusinessViewsCount(businessId, period) {
//   let startDate;
//   const endDate = moment().format("YYYY-MM-DD");

//   if (period === "weekly") {
//     startDate = moment().subtract(7, "days").format("YYYY-MM-DD");
//   } else if (period === "monthly") {
//     startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
//   } else if (period === "yearly") {
//     startDate = moment().subtract(365, "days").format("YYYY-MM-DD");
//   } else if (period === "alltime") {
//     startDate = null; // No filter on date
//   } else {
//     throw new Error("Invalid period specified");
//   }

//   const matchFilter = {
//     business: businessId,
//   };

//   if (startDate) {
//     matchFilter.date = { $gte: startDate, $lte: endDate };
//   }

//   const views = await BusinessView.find(matchFilter);

//   const totalViews = views.length;

//   // Unique views per day by (user or IP)
//   // Use a Set of `date-user/ip` combos to get unique views
//   const uniqueViewKeys = new Set();
//   const uniqueUsersSet = new Set();

//   views.forEach((v) => {
//     const key = v.user
//       ? `${v.date}-user-${v.user.toString()}`
//       : `${v.date}-ip-${v.ipAddress}`;
//     uniqueViewKeys.add(key);
//     if (v.user) uniqueUsersSet.add(v.user.toString());
//   });

//   return {
//     totalViews,
//     //totalUniqueViews: uniqueViewKeys.size,
//     totalUniqueUsers: uniqueUsersSet.size,
//     startDate: startDate || "beginning",
//     endDate,
//     period,
//   };
// }

async function getBusinessViewsCount(businessId, period) {
  const endDate = moment().endOf("day").toDate();
  let startDate;

  let groupFormat; // Determines how to group data

  if (period === "weekly") {
    startDate = moment().subtract(6, "days").startOf("day").toDate(); // includes today
    groupFormat = "%Y-%m-%d"; // daily
  } else if (period === "monthly") {
    startDate = moment().subtract(29, "days").startOf("day").toDate();
    groupFormat = "%Y-%m-%d"; // daily
  } else if (period === "yearly") {
    startDate = moment().subtract(11, "months").startOf("month").toDate();
    groupFormat = "%Y-%m"; // monthly
  } else {
    throw new Error("Invalid period specified");
  }

  const viewsData = await BusinessView.aggregate([
    {
      $match: {
        business: new mongoose.Types.ObjectId(businessId),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          groupDate: {
            $dateToString: { format: groupFormat, date: "$createdAt" },
          },
        },
        totalViews: { $sum: 1 },
        uniqueUsers: {
          $addToSet: {
            $cond: [
              { $ifNull: ["$user", false] },
              { $concat: ["user-", { $toString: "$user" }] },
              { $concat: ["ip-", "$ipAddress"] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id.groupDate",
        totalViews: 1,
        uniqueViews: { $size: "$uniqueUsers" },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  return {
    period,
    startDate,
    endDate,
    breakdown: viewsData, // list of { date, totalViews, uniqueViews }
  };
}

async function getBusinessReviewStats(businessId, period) {
  let startDate;
  const endDate = moment().endOf("day").toDate();

  if (period === "weekly") {
    startDate = moment().subtract(7, "days").startOf("day").toDate();
  } else if (period === "monthly") {
    startDate = moment().subtract(30, "days").startOf("day").toDate();
  } else if (period === "yearly") {
    startDate = moment().subtract(365, "days").startOf("day").toDate();
  } else {
    throw new Error("Invalid period");
  }

  const stats = await Review.aggregate([
    {
      $match: {
        business: new mongoose.Types.ObjectId(businessId),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $facet: {
        totalReviews: [{ $count: "count" }],
        averageRating: [
          {
            $group: {
              _id: null,
              avg: { $avg: "$rating" },
            },
          },
        ],
        ratingBreakdown: [
          {
            $group: {
              _id: "$rating",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const result = stats[0];

  return {
    period,
    startDate,
    endDate,
    totalReviews: result.totalReviews[0]?.count || 0,
    averageRating: result.averageRating[0]?.avg?.toFixed(1) || "0.0",
    ratingBreakdown: result.ratingBreakdown.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {}),
  };
}

module.exports = {
  trackBusinessView,
  getBusinessViewsCount,
  getBusinessReviewStats,
};
