const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateCurrentUser,
    deleteCurrentUser,
    getAllUsers,
    searchUsers,
    getFriends,
    getFriendRequests,
    getSentFriendRequests,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
} = require("../controllers/userController");

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

        const extension =
            path.extname(file.originalname);

        callback(null, uniqueName + extension);
    }
});

const upload = multer({
    storage: storage
});
router.get(
    "/",
    requireLogin,
    getAllUsers
);

router.get(
    "/search",
    requireLogin,
    searchUsers
);

router.post(
    "/register",
    registerUser
);

router.post(
    "/login",
    loginUser
);

router.post(
    "/logout",
    requireLogin,
    logoutUser
);

router.get(
    "/me",
    requireLogin,
    getCurrentUser
);

router.put(
    "/me",
    requireLogin,
    upload.single("profileImage"),
    updateCurrentUser
);

router.delete(
    "/me",
    requireLogin,
    deleteCurrentUser
);


router.get(
    "/friends",
    requireLogin,
    getFriends
);

router.get(
    "/friend-requests",
    requireLogin,
    getFriendRequests
);

router.get(
    "/sent-friend-requests",
    requireLogin,
    getSentFriendRequests
);

router.post(
    "/:userId/friend-request",
    requireLogin,
    sendFriendRequest
);

router.delete(
    "/:userId/friend-request",
    requireLogin,
    cancelFriendRequest
);

router.post(
    "/friend-requests/:userId/accept",
    requireLogin,
    acceptFriendRequest
);

router.delete(
    "/friend-requests/:userId",
    requireLogin,
    rejectFriendRequest
);

router.delete(
    "/friends/:userId",
    requireLogin,
    removeFriend
);


module.exports = router;