const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");
const upload = require("../middleware/upload");

// ✅ Create new category (with icon + image upload)
router.post(
  "/",
  verifyToken,
  requireRole("admin"),
  upload.uploadCategoryImages,
  categoryController.createCategory
);

// ✅ Bulk upload categories (text only, no files)
router.post(
  "/bulkuploadcategories",
  verifyToken,
  requireRole("admin"),
  categoryController.bulkUploadCategories
);

// ✅ Get all categories (public)
router.get("/", categoryController.getAllCategories);

// ✅ Get single category by ID
router.get(
  "/:id",
  verifyToken,
  requireRole("admin"),
  categoryController.getCategoryById
);

// ✅ Update category (with optional new icon/image upload)
router.put(
  "/:id",
  verifyToken,
  requireRole("admin"),
  upload.uploadCategoryImages,
  categoryController.updateCategory
);

// ✅ Delete category
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  categoryController.deleteCategory
);

module.exports = router;
