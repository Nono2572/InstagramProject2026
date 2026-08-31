const express = require("express");
const multer = require("multer");
const path = require("path");

const postController = require("../controllers/PostController");

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

router.get("/", postController.getPosts);

router.post(
    "/",
    upload.single("media"),
    postController.createPost
);

router.put(
    "/:id",
    upload.single("media"),
    postController.updatePost
);

router.delete(
    "/:id",
    postController.deletePost
);

module.exports = router;