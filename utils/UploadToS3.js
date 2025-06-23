const {
  uploadFile,
  deleteFile,
  getObjectSignedUrl,
  extractS3Key,
} = require("../utils/s3Utils");
const generateUniqueFileKey = require("./generateFileKey");

// Uploads a file, deletes old one if provided, returns key + preview URL
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided" });
    }

    const file = req.file;
    const filekey = generateUniqueFileKey(file.originalname, "files/");
    const fileName = generateUniqueFileKey(filekey);

    // Upload to S3
    await uploadFile(file.buffer, fileName, file.mimetype);

    // Delete old file if applicable
    const oldUrl = req.body.oldUrl;
    if (oldUrl) {
      const oldKey = extractS3Key(oldUrl);
      if (oldKey) {
        await deleteFile(oldKey);
      }
    }

    // Get signed URL for preview
    const signedUrl = await getObjectSignedUrl(fileName);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      key: fileName,
      url: signedUrl,
    });
  } catch (err) {
    console.error("Image upload error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Image upload failed" });
  }
};
