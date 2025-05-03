const Section = require("../models/Section");

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const { heading, page } = req.body;
    const newSection = await Section.create({ heading, page });
    res.status(201).json(newSection);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all sections for a page
exports.getSectionsByPage = async (req, res) => {
  try {
    const { page } = req.params;
    const sections = await Section.find({ page }).sort("createdAt");
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update section heading
exports.updateSectionHeading = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading } = req.body;

    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.heading = heading;
    section.updatedAt = Date.now();
    await section.save();

    res.json(section);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add images to section
exports.addImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body; // expects array of { url }

    if (!Array.isArray(images)) {
      return res.status(400).json({ message: "Images must be an array" });
    }

    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const newImages = images.map((img, index) => ({
      url: img.url,
      sortOrder: section.images.length + index,
    }));

    section.images.push(...newImages);
    section.updatedAt = Date.now();
    await section.save();

    res.json(section);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove image from section
exports.removeImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.images = section.images.filter(
      (img) => img._id.toString() !== imageId
    );
    section.updatedAt = Date.now();
    await section.save();

    res.json(section);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete section
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findByIdAndDelete(id);
    if (!section) return res.status(404).json({ message: "Section not found" });

    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
