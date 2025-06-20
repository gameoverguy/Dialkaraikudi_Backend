const express = require("express");
const router = express.Router();
const feedPostController = require("../controllers/feedPostController");
const verifyToken = require("../middleware/VerifyToken");

// Get feed
router.get("/", feedPostController.getFeed);

// Get posts by business ID (public or admin)
router.get("/business/:id", feedPostController.getPostsByBusinessId);

// Get posts by post ID (public or admin)
router.get("/:id", feedPostController.getPostById);

// Create post (only business)
router.post("/", feedPostController.createPost);

// Toggle like (user or business)
router.put("/:postId/like", feedPostController.toggleLike);

// Edit description (only business owner)
router.put("/:postId/edit", feedPostController.editDescription);

// Delete post (only business owner)
router.delete("/:postId", feedPostController.deletePost);

module.exports = router;
