const Advertisement = require("../models/Advertisement");

// ✅ 1. Get all pages with ads
exports.getAllPages = async (req, res) => {
  try {
    const pages = await Advertisement.find().distinct("page");
    res.json({ pages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ 2. Get slots for a specific page
exports.getSlotsByPage = async (req, res) => {
  try {
    const { page } = req.params;
    let doc = await Advertisement.findOne({ page });

    if (!doc) {
      doc = await Advertisement.create({ page, slots: [] });
    }

    res.json({ slots: doc.slots });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ 3. Create slot on a page
exports.createSlot = async (req, res) => {
  try {
    const { page } = req.params;
    const { heading, type, interval, mediaItems } = req.body;

    let doc = await Advertisement.findOne({ page });
    if (!doc) doc = await Advertisement.create({ page, slots: [] });

    const newSlot = {
      heading,
      type,
      interval,
      mediaItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    doc.slots.push(newSlot);
    await doc.save();

    res.status(201).json({ slot: newSlot });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ 4. Update slot
exports.updateSlot = async (req, res) => {
  try {
    const { page, slotId } = req.params;
    const { heading, type, interval } = req.body;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slot = doc.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (heading !== undefined) slot.heading = heading;
    if (type !== undefined) slot.type = type;
    if (interval !== undefined) slot.interval = interval;

    slot.updatedAt = new Date();
    await doc.save();

    res.json({ message: "Slot updated", slot });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ 5. Delete slot
exports.deleteSlot = async (req, res) => {
  try {
    const { page, slotId } = req.params;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    doc.slots = doc.slots.filter((slot) => slot._id.toString() !== slotId);
    await doc.save();

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ 6. Add media item to a slot
exports.addMediaToSlot = async (req, res) => {
  try {
    const { page, slotId } = req.params;
    const { url, type, htmlContent, priority } = req.body;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slot = doc.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.mediaItems.push({
      url,
      type,
      htmlContent: htmlContent || "",
      enabled: true,
      priority: priority || 1,
    });

    slot.updatedAt = new Date();
    await doc.save();

    res
      .status(201)
      .json({ message: "Media added", mediaItems: slot.mediaItems });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ 7. Update media item
exports.updateMediaItem = async (req, res) => {
  try {
    const { page, slotId, mediaId } = req.params;
    const { url, type, htmlContent, enabled, priority } = req.body;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slot = doc.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    const media = slot.mediaItems.id(mediaId);
    if (!media)
      return res.status(404).json({ message: "Media item not found" });

    if (url !== undefined) media.url = url;
    if (type !== undefined) media.type = type;
    if (htmlContent !== undefined) media.htmlContent = htmlContent;
    if (enabled !== undefined) media.enabled = enabled;
    if (priority !== undefined) media.priority = priority;

    slot.updatedAt = new Date();
    await doc.save();

    res.json({ message: "Media updated", media });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ 8. Delete media item
exports.deleteMediaItem = async (req, res) => {
  try {
    const { page, slotId, mediaId } = req.params;

    const doc = await Advertisement.findOne({ page });
    if (!doc) return res.status(404).json({ message: "Page not found" });

    const slot = doc.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.mediaItems = slot.mediaItems.filter(
      (item) => item._id.toString() !== mediaId
    );
    slot.updatedAt = new Date();
    await doc.save();

    res.json({ message: "Media item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
