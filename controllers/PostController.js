const Post = require("../models/Post");

exports.getPosts = async function (req, res) {
    try {
        const searchText = req.query.search || "";
        const postType = req.query.type || "all";

        const filter = {};

        if (postType !== "all") {
            filter.postType = postType;
        }

        if (searchText !== "") {
            filter.$or = [
                { caption: { $regex: searchText, $options: "i" } },
                { location: { $regex: searchText, $options: "i" } }
            ];
        }

        const posts = await Post.find(filter)
            .populate("author", "username fullName profileImage")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get posts.",
            error: error.message
        });
    }
};


exports.createPost = async function (req, res) {
    try {
        const postType = req.body.postType;
        const caption = req.body.caption || "";
        const location = req.body.location || "";

        if (!postType) {
            return res.status(400).json({
                success: false,
                message: "Post type is required."
            });
        }

        if (postType === "text" && caption.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Text posts must contain text."
            });
        }

        let mediaUrl = "";

        if (req.file) {
            mediaUrl = "/uploads/" + req.file.filename;
        }

        if (postType !== "text" && mediaUrl === "") {
            return res.status(400).json({
                success: false,
                message: "Image and video posts must contain media."
            });
        }

        const newPost = await Post.create({
            author: req.session.userId,
            postType: postType,
            caption: caption,
            mediaUrl: mediaUrl,
            location: location
        });

        const populatedPost = await Post.findById(newPost._id)
            .populate("author", "username fullName profileImage");

        res.status(201).json({
            success: true,
            post: populatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create post.",
            error: error.message
        });
    }
};


exports.updatePost = async function (req, res) {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        if (post.author.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own posts."
            });
        }

        post.caption = req.body.caption || post.caption;
        post.location = req.body.location || post.location;

        if (req.file) {
            post.mediaUrl = "/uploads/" + req.file.filename;
        }

        await post.save();

        res.json({
            success: true,
            post: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update post.",
            error: error.message
        });
    }
};


exports.deletePost = async function (req, res) {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        if (post.author.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own posts."
            });
        }

        await post.deleteOne();

        res.json({
            success: true,
            message: "Post deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete post.",
            error: error.message
        });
    }
};