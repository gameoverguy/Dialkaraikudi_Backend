const Favourite = require("../models/Favourite");
const Business = require("../models/Business");

// ✅ Add to favourites
exports.addToFavourites = async (req, res) => {
  try {
    const { user, business } = req.body;

    if (!user || !business) {
      return res
        .status(400)
        .json({ success: false, error: "User and Business ID required" });
    }

    const favourite = await Favourite.create({ user, business });

    res.status(201).json({ success: true, data: favourite });
  } catch (err) {
    // Handle duplicate favorite gracefully
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Already favourited" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Remove from favourites
exports.removeFromFavourites = async (req, res) => {
  try {
    const { user, business } = req.body;

    const favourite = await Favourite.findOneAndDelete({ user, business });

    if (!favourite) {
      return res
        .status(404)
        .json({ success: false, error: "Favourite not found" });
    }

    res.status(200).json({ success: true, message: "Removed from favourites" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get all favourites of a user
exports.getUserFavourites = async (req, res) => {
  try {
    const { user } = req.query;

    const favourites = await Favourite.find({ user })
      .populate("business")
      .then((favs) => favs.filter((fav) => fav.business)); // filter out nulls

    res.status(200).json({ success: true, data: favourites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Check if a business is favourited by a user
exports.isFavourited = async (req, res) => {
  try {
    const { user, business } = req.query;

    const exists = await Favourite.exists({ user, business });

    res.status(200).json({ success: true, favourited: !!exists });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
