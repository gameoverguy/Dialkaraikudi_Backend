const FeedPost = require("../models/FeedPost");
const Business = require("../models/Business");
const User = require("../models/User");

// Create new feed post
exports.createPost = async (req, res) => {
  try {
    const { description, imageUrl, businessId } = req.body;

    if (!imageUrl)
      return res.status(400).json({ message: "Image is required" });

    if (!businessId)
      return res.status(400).json({ message: "Business ID is required" });

    const newPost = await FeedPost.create({
      business: businessId,
      imageUrl,
      description,
    });

    res.status(201).json(newPost);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create post", error: err.message });
  }
};

// Get all active feed posts
exports.getFeed = async (req, res) => {
  try {
    const posts = await FeedPost.find({ isExpired: false })
      .sort({ createdAt: -1 })
      .populate("business", "businessName logoUrl");

    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch feed", error: err.message });
  }
};

// Get a single feed post by ID
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await FeedPost.findById(postId).populate(
      "business",
      "businessName logoUrl"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch post", error: err.message });
  }
};

// Get all posts by a business ID (public/vendor panel)
exports.getPostsByBusinessId = async (req, res) => {
  try {
    const businessId = req.params.id;

    const posts = await FeedPost.find({ business: businessId })
      .sort({ createdAt: -1 })
      .populate("business", "businessName logoUrl")
      .lean();

    const postsWithLikeCount = posts.map((post) => ({
      ...post,
      likeCount: post.likes?.length || 0,
    }));

    res.json(postsWithLikeCount);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: err.message });
  }
};

// Toggle like/unlike
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, userType } = req.body;

    if (!userId || !userType)
      return res
        .status(400)
        .json({ message: "userId and userType are required" });

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.find(
      (like) =>
        like.user.toString() === userId.toString() && like.userType === userType
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (like) =>
          !(
            like.user.toString() === userId.toString() &&
            like.userType === userType
          )
      );
    } else {
      post.likes.push({ user: userId, userType });
    }

    await post.save();
    res.json({ message: alreadyLiked ? "Unliked" : "Liked" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to toggle like", error: err.message });
  }
};

// Edit description
exports.editDescription = async (req, res) => {
  try {
    const { postId } = req.params;
    const { description, businessId } = req.body;

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.business.toString() !== businessId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.description = description || "";
    await post.save();

    res.json({ message: "Description updated", post });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update post", error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { businessId } = req.body;

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.business.toString() !== businessId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await FeedPost.findByIdAndDelete(postId);

    res.json({ message: "Post deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete post", error: err.message });
  }
};
