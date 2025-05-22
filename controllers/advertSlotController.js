const AdvertSlot = require("../models/AdvertSlot");
const Business = require("../models/Business");

// 1. Create Advert Slot
exports.createAdvertSlot = async (req, res) => {
  try {
    const slot = await AdvertSlot.create(req.body);
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Advert Slots (with optional filters)
exports.getAdvertSlots = async (req, res) => {
  try {
    const { page, isActive } = req.query;
    const filter = {};
    if (page) filter.page = page;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    // const slots = await AdvertSlot.find(filter).populate(
    //   "allowedBusinesses",
    //   "businessName"
    // );

    const slots = await AdvertSlot.find();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Single Advert Slot by ID
exports.getAdvertSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await AdvertSlot.findById(id).populate(
      "allowedBusinesses",
      "businessName"
    );
    if (!slot)
      return res.status(404).json({ message: "Advert slot not found" });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Advert Slot
exports.updateAdvertSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSlot = await AdvertSlot.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedSlot)
      return res.status(404).json({ message: "Advert slot not found" });
    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Delete Advert Slot
exports.deleteAdvertSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSlot = await AdvertSlot.findByIdAndDelete(id);
    if (!deletedSlot)
      return res.status(404).json({ message: "Advert slot not found" });
    res.json({ message: "Advert slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Assign Business to Slot
exports.assignBusinessToSlot = async (req, res) => {
  try {
    const { slotId, businessId } = req.body;

    const slot = await AdvertSlot.findById(slotId);
    if (!slot)
      return res.status(404).json({ message: "Advert slot not found" });

    if (!slot.allowedBusinesses.includes(businessId)) {
      slot.allowedBusinesses.push(businessId);
      await slot.save();
    }

    res.json({ message: "Business assigned to slot", success: true, slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Remove Business from Slot
exports.removeBusinessFromSlot = async (req, res) => {
  try {
    const { slotId, businessId } = req.body;

    const slot = await AdvertSlot.findById(slotId);
    if (!slot)
      return res.status(404).json({ message: "Advert slot not found" });

    slot.allowedBusinesses = slot.allowedBusinesses.filter(
      (id) => id.toString() !== businessId
    );
    await slot.save();

    res.json({ message: "Business removed from slot", slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
