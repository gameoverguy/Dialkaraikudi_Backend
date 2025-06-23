const multer = require("multer");

const storage = multer.memoryStorage(); // keep in memory for S3
const upload = multer({ storage });

const uploadBusinessImages = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "primaryPhoto", maxCount: 1 },
  { name: "photos", maxCount: 6 },
]);

const uploadCategoryImages = upload.fields([
  { name: "icon", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

module.exports = {
  upload,
  uploadBusinessImages,
  uploadCategoryImages,
};
