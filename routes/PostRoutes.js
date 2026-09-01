const express = require("express");
const multer = require("multer");
const path = require("path");

const postController = require("../controllers/PostController");

const {
    requireLogin
} = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "public/uploads");
    },

    filename: function (req, file, callback) {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1000000);

        const extension = path.extname(file.originalname);

        callback(null, uniqueName + extension);
    }
});

const upload = multer({
    storage: storage
});

router.get(
    "/",
    requireLogin,
    postController.getPosts
);

router.get(
    "/reels",
    requireLogin,
    postController.getReels
);

router.post(
    "/",
    requireLogin,
    upload.single("media"),
    postController.createPost
);

router.post(
    "/:id/comments",
    requireLogin,
    postController.addComment
);

router.put(
    "/:id",
    requireLogin,
    upload.single("media"),
    postController.updatePost
);

router.post(
    "/:id/like",
    requireLogin,
    postController.toggleLike
);


router.get(
    "/:id/comments",
    requireLogin,
    postController.getComments
);


router.post(
    "/:id/comments",
    requireLogin,
    postController.addComment
);

router.delete(
    "/:id",
    requireLogin,
    postController.deletePost
);

module.exports = router;