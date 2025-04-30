const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// 🔹 Category Routes
router.post("/", categoryController.createCategory);
router.post("/bulkuploadcategories", categoryController.bulkUploadCategories);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
