const Category = require("../models/Category");
const {
  uploadFile,
  deleteFile,
  getObjectSignedUrl,
} = require("../utils/s3Utils");
const generateUniqueFileKey = require("../utils/generateFileKey");

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

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    const dataWithSignedUrls = await Promise.all(
      categories.map(async (cat) => {
        return {
          ...cat._doc,
          iconUrl: cat.iconUrl ? await getObjectSignedUrl(cat.iconUrl) : null,
          imageUrl: cat.imageUrl
            ? await getObjectSignedUrl(cat.imageUrl)
            : null,
        };
      })
    );

    res.status(200).json({ success: true, data: dataWithSignedUrls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const withSignedUrls = {
      ...category._doc,
      iconUrl: category.iconUrl
        ? await getObjectSignedUrl(category.iconUrl)
        : null,
      imageUrl: category.imageUrl
        ? await getObjectSignedUrl(category.imageUrl)
        : null,
    };

    res.status(200).json({ success: true, data: withSignedUrls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Upload new icon if provided

    console.log(req.files);

    if (req.files?.icon?.[0]) {
      const iconFile = req.files.icon[0];

      const iconKey = generateUniqueFileKey(
        iconFile.originalname,
        "categories/icons"
      );
      await uploadFile(iconFile.buffer, iconKey, iconFile.mimetype);

      if (category.iconUrl) await deleteFile(category.iconUrl); // optional
      req.body.iconUrl = iconKey;
    }

    // Upload new image if provided
    if (req.files?.image?.[0]) {
      const imageFile = req.files.image[0];
      const imageKey = generateUniqueFileKey(
        imageFile.originalname,
        "categories/images"
      );
      await uploadFile(imageFile.buffer, imageKey, imageFile.mimetype);

      if (category.imageUrl) await deleteFile(category.imageUrl); // optional
      req.body.imageUrl = imageKey;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (category.iconUrl) await deleteFile(category.iconUrl);
    if (category.imageUrl) await deleteFile(category.imageUrl);

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
