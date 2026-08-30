const express = require("express");

const {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateCurrentUser,
    deleteCurrentUser
} = require("../controllers/userController");

const {
    requireLogin
} = require("../middleware/authMiddleware");

const router = express.Router();

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
    updateCurrentUser
);

router.delete(
    "/me",
    requireLogin,
    deleteCurrentUser
);

module.exports = router;