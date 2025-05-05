const Category = require("../models/Category");

// ✅ Create new Category
exports.createCategory = async (req, res) => {
  try {
    const {
      categoryName,
      displayName,
      description,
      iconUrl,
      imageUrl,
      categoryType,
    } = req.body;

    const existing = await Category.findOne({ categoryName });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists." });
    }

    const category = await Category.create({
      categoryName,
      displayName,
      description,
      iconUrl,
      imageUrl,
      categoryType,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Single Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Category
exports.updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Bulk Upload Categories
exports.bulkUploadCategories = async (req, res) => {
  try {
    const categories = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: "Data must be an array of categories.",
      });
    }

    const results = {
      created: [],
      skipped: [],
      errors: [],
    };

    for (const cat of categories) {
      const {
        categoryName,
        displayName,
        description,
        iconUrl,
        imageUrl,
        categoryType,
      } = cat;

      if (!categoryName || !displayName) {
        results.errors.push({
          categoryName,
          message: "categoryName and displayName are required.",
        });
        continue;
      }

      const existing = await Category.findOne({ categoryName });

      if (existing) {
        results.skipped.push({
          categoryName,
          message: "Category already exists.",
        });
        continue;
      }

      try {
        const newCat = await Category.create({
          categoryName,
          displayName,
          description,
          iconUrl,
          imageUrl,
          categoryType,
        });
        results.created.push(newCat);
      } catch (err) {
        results.errors.push({ categoryName, message: err.message });
      }
    }

    res.status(201).json({ success: true, result: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
