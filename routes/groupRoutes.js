const express = require("express");

const {
    createGroup,
    getAllGroups,
    getGroupById,
    searchGroups,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup
} = require(
    "../controllers/groupController"
);

const {
    requireLogin
} = require(
    "../middleware/authMiddleware"
);


const router = express.Router();


router.get(
    "/",
    requireLogin,
    getAllGroups
);


router.get(
    "/search",
    requireLogin,
    searchGroups
);


router.post(
    "/",
    requireLogin,
    createGroup
);


router.get(
    "/:id",
    requireLogin,
    getGroupById
);


router.put(
    "/:id",
    requireLogin,
    updateGroup
);


router.delete(
    "/:id",
    requireLogin,
    deleteGroup
);


router.post(
    "/:id/join",
    requireLogin,
    joinGroup
);


router.post(
    "/:id/leave",
    requireLogin,
    leaveGroup
);


module.exports = router;