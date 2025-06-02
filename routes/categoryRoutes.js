const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

//used for creating new category
router.post(
  "/",
  verifyToken,
  requireRole("admin"),
  categoryController.createCategory
);
// bulk upload categories
router.post(
  "/bulkuploadcategories",
  verifyToken,
  requireRole("admin"),
  categoryController.bulkUploadCategories
);
// get all category
router.get("/", categoryController.getAllCategories);
// get the details of a particular category
router.get(
  "/:id",
  verifyToken,
  requireRole("admin"),
  categoryController.getCategoryById
);
// update the details of a particular category
router.put(
  "/:id",
  verifyToken,
  requireRole("admin"),
  categoryController.updateCategory
);
// delete the particular category
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  categoryController.deleteCategory
);

module.exports = router;
