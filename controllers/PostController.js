const mongoose = require("mongoose");
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

        const posts =
    await Post.find(filter)
        .populate(
            "author",
            "username fullName profileImage"
        )
        .populate(
            "group",
            "name"
        )
        .sort({
            createdAt: -1
        });


const currentUserId =
    String(
        req.session.userId ||
        (
            req.session.user &&
            req.session.user._id
        ) ||
        ""
    );


const postsForFrontend =
    posts.map(
        function (post) {

            const postObject =
                post.toObject();


            postObject.isLiked =
                post.likedBy.some(
                    function (likedUserId) {

                        return (
                            String(likedUserId) ===
                            currentUserId
                        );
                    }
                );


            return postObject;
        }
    );


res.json({
    success: true,
    posts: postsForFrontend
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
        const groupId = req.body.group || "";

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

        const userId = req.session.userId || (req.session.user && req.session.user._id);

        if (groupId !== "" && !mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({
        success: false,
        message: "Invalid group selected."
    });
}

        const newPost = await Post.create({
            author: userId,
            postType: postType,
            caption: caption,
            mediaUrl: mediaUrl,
            location: location,
            group: groupId || null
        });

        const populatedPost = await Post.findById(newPost._id)
    .populate("author", "username fullName profileImage")
    .populate("group", "name");

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

        const userId =
            req.session.userId ||
            (req.session.user && req.session.user._id);

        if (
            !post.author ||
            post.author.toString() !== userId
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own posts."
            });
        }

        post.caption =
            req.body.caption || post.caption;

        post.location =
            req.body.location || post.location;

        if (req.file) {
            post.mediaUrl =
                "/uploads/" + req.file.filename;
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate("author", "username fullName profileImage");

        res.json({
            success: true,
            post: updatedPost
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

        const userId =
            req.session.userId ||
            (req.session.user && req.session.user._id);

        if (
            !post.author ||
            post.author.toString() !== userId
        ) {
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

exports.getReels = async function (req, res) {
    try {
        const reels = await Post.find({
            postType: "video"
        })
            .populate("author", "username fullName profileImage")
            .populate("group", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reels: reels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get reels.",
            error: error.message
        });
    }
};

exports.toggleLike = async function (req, res) {

    try {

        const post =
            await Post.findById(
                req.params.id
            );


        if (!post) {

            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }


        const userId =
            req.session.userId ||
            (
                req.session.user &&
                req.session.user._id
            );


        const alreadyLiked =
            post.likedBy.some(
                function (likedUserId) {

                    return (
                        likedUserId.toString() ===
                        userId.toString()
                    );
                }
            );


        if (alreadyLiked) {

            post.likedBy.pull(
                userId
            );

        } else {

            post.likedBy.addToSet(
                userId
            );
        }


        /*
            The number shown in the UI
            always matches the database.
        */

        post.likes =
            post.likedBy.length;


        await post.save();


        return res.json({
            success: true,

            liked:
                !alreadyLiked,

            likes:
                post.likes
        });


    } catch (error) {

        console.error(
            "Like error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Could not update like."
        });
    }
};

exports.getComments = async function (
    req,
    res
) {

    try {

        const post =
            await Post.findById(
                req.params.id
            )
            .populate(
                "comments.author",
                "username fullName profileImage"
            );


        if (!post) {

            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }


        return res.json({
            success: true,

            comments:
                post.comments,

            commentsCount:
                post.comments.length
        });


    } catch (error) {

        console.error(
            "Get comments error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Could not load comments."
        });
    }
};

exports.addComment = async function (
    req,
    res
) {

    try {

        const text =
            String(
                req.body.text || ""
            ).trim();


        if (text === "") {

            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot be empty."
            });
        }


        if (text.length > 300) {

            return res.status(400).json({
                success: false,
                message:
                    "Comment may contain at most 300 characters."
            });
        }


        const post =
            await Post.findById(
                req.params.id
            );


        if (!post) {

            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }


        const userId =
            req.session.userId ||
            (
                req.session.user &&
                req.session.user._id
            );


        post.comments.push({
            author: userId,
            text: text
        });


        post.commentsCount =
            post.comments.length;


        await post.save();


        /*
            Load it again with author information
            so the frontend receives username/image.
        */

        const populatedPost =
            await Post.findById(
                post._id
            )
            .populate(
                "comments.author",
                "username fullName profileImage"
            );


        const newComment =
            populatedPost.comments[
                populatedPost.comments.length - 1
            ];


        return res.status(201).json({
            success: true,

            comment:
                newComment,

            commentsCount:
                populatedPost.comments.length
        });


    } catch (error) {

        console.error(
            "Add comment error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Could not add comment."
        });
    }
};