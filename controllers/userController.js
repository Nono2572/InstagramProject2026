const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

function getErrorMessage(error) {
    if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyPattern)[0];

        return duplicatedField + " already exists.";
    }

    if (error.name === "ValidationError") {
        const validationError = Object.values(error.errors)[0];

        return validationError.message;
    }

    return "An unexpected server error occurred.";
}

async function registerUser(req, res) {
    try {
        const username = String(req.body.username || "").trim();
        const email = String(req.body.email || "").trim();
        const password = String(req.body.password || "");
        const fullName = String(req.body.fullName || "").trim();

        if (
            username === "" ||
            email === "" ||
            password === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Username, email and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        const existingUser = await User.findOne({
            $or: [
                {
                    username: username.toLowerCase()
                },
                {
                    email: email.toLowerCase()
                }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists."
            });
        }

        const encryptedPassword = await bcrypt.hash(
            password,
            10
        );

        const newUser = await User.create({
            username: username,
            email: email,
            password: encryptedPassword,
            fullName: fullName
        });

        req.session.userId = newUser._id.toString();

        return res.status(201).json({
            success: true,
            message: "Registration completed successfully.",

            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                bio: newUser.bio,
                profileImage: newUser.profileImage
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: getErrorMessage(error)
        });
    }
}

async function loginUser(req, res) {
    try {
        const username = String(
            req.body.username || ""
        )
            .trim()
            .toLowerCase();

        const password = String(
            req.body.password || ""
        );

        if (
            username === "" ||
            password === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        const user = await User.findOne({
            username: username
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Incorrect username or password."
            });
        }

        const passwordIsCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordIsCorrect) {
            return res.status(401).json({
                success: false,
                message: "Incorrect username/email or password."
            });
        }

        req.session.userId = user._id.toString();

        return res.status(200).json({
            success: true,
            message: "Login completed successfully."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An unexpected server error occurred."
        });
    }
}

function logoutUser(req, res) {
    req.session.destroy(function (error) {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Logout failed."
            });
        }

        res.clearCookie("connect.sid");

        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });
    });
}

async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(
            req.session.userId
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        return res.status(200).json({
            success: true,

            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                bio: user.bio,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                friendCount: user.friends.length,
                friendRequestCount: user.friendRequests.length
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not load the profile."
        });
    }
}

async function updateCurrentUser(req, res) {
    try {
        const updatedFields = {};

        if (req.body.username !== undefined) {
            updatedFields.username = String(
                req.body.username
            ).trim();
        }

        if (req.body.email !== undefined) {
            updatedFields.email = String(
                req.body.email
            ).trim();
        }

        if (req.body.fullName !== undefined) {
            updatedFields.fullName = String(
                req.body.fullName
            ).trim();
        }

        if (req.body.bio !== undefined) {
            updatedFields.bio = String(
                req.body.bio
            ).trim();
        }

        if (req.body.profileImage !== undefined) {
            updatedFields.profileImage =
                String(req.body.profileImage).trim() ||
                "images/BlankProfile.jpg";
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            updatedFields,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",

            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                bio: updatedUser.bio,
                profileImage: updatedUser.profileImage
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: getErrorMessage(error)
        });
    }
}

async function deleteCurrentUser(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(
            req.session.userId
        );

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        await User.updateMany(
            {},
            {
                $pull: {
                    friends: deletedUser._id,
                    friendRequests: deletedUser._id
                }
            }
        );

        req.session.destroy(function (error) {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "The account was deleted, but the session could not be closed."
                });
            }

            res.clearCookie("connect.sid");

            return res.status(200).json({
                success: true,
                message: "Account deleted successfully."
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not delete the account."
        });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await User.find()
            .select(
                "username fullName bio profileImage"
            )
            .sort({
                username: 1
            });

        return res.status(200).json({
            success: true,
            users: users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not load users."
        });
    }
    
}

async function searchUsers(req, res) {
    try {
        const searchText = String(
            req.query.q || ""
        ).trim();

        const username = String(
            req.query.username || ""
        ).trim();

        const fullName = String(
            req.query.fullName || ""
        ).trim();

        const query = {
            _id: { $ne: req.session.userId }
        };

        if (searchText !== "") {
            query.$or = [
                {
                    username: {
                        $regex: searchText,
                        $options: "i"
                    }
                },
                {
                    fullName: {
                        $regex: searchText,
                        $options: "i"
                    }
                }
            ];
        } else {
            if (username !== "") {
                query.username = {
                    $regex: username,
                    $options: "i"
                };
            }

            if (fullName !== "") {
                query.fullName = {
                    $regex: fullName,
                    $options: "i"
                };
            }
        }

        const users = await User.find(query)
            .select(
                "username fullName bio profileImage"
            );

        return res.status(200).json({
            success: true,
            users: users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not search users."
        });
    }
}


async function getFriends(req, res) {
    try {
        const user = await User.findById(req.session.userId)
            .populate(
                "friends",
                "username fullName bio profileImage"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        return res.status(200).json({
            success: true,
            friends: user.friends
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not load friends."
        });
    }
}

async function getFriendRequests(req, res) {
    try {
        const user = await User.findById(req.session.userId)
            .populate(
                "friendRequests",
                "username fullName bio profileImage"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        return res.status(200).json({
            success: true,
            friendRequests: user.friendRequests
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not load friend requests."
        });
    }
}

async function getSentFriendRequests(req, res) {
    try {
        const users = await User.find({
            friendRequests: req.session.userId
        })
            .select("username fullName bio profileImage")
            .sort({ username: 1 });

        return res.status(200).json({
            success: true,
            sentFriendRequests: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not load sent friend requests."
        });
    }
}

async function cancelFriendRequest(req, res) {
    try {
        const currentUserId = req.session.userId;
        const targetUserId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        const requestExists = targetUser.friendRequests.some(
            requestId => requestId.toString() === currentUserId
        );

        if (!requestExists) {
            return res.status(404).json({
                success: false,
                message: "Sent friend request was not found."
            });
        }

        targetUser.friendRequests.pull(currentUserId);
        await targetUser.save();

        return res.status(200).json({
            success: true,
            message: "Friend request cancelled."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not cancel friend request."
        });
    }
}

async function sendFriendRequest(req, res) {
    try {
        const currentUserId = req.session.userId;
        const targetUserId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        if (currentUserId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a friend request to yourself."
            });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        const alreadyFriends = currentUser.friends.some(
            friendId => friendId.toString() === targetUserId
        );

        if (alreadyFriends) {
            return res.status(409).json({
                success: false,
                message: "You are already friends."
            });
        }

        const requestAlreadySent = targetUser.friendRequests.some(
            requestId => requestId.toString() === currentUserId
        );

        if (requestAlreadySent) {
            return res.status(409).json({
                success: false,
                message: "Friend request was already sent."
            });
        }

        const reverseRequestExists = currentUser.friendRequests.some(
            requestId => requestId.toString() === targetUserId
        );

        if (reverseRequestExists) {
            return res.status(409).json({
                success: false,
                message: "This user already sent you a friend request. Accept it instead."
            });
        }

        targetUser.friendRequests.addToSet(currentUser._id);
        await targetUser.save();

        return res.status(200).json({
            success: true,
            message: "Friend request sent."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not send friend request."
        });
    }
}

async function acceptFriendRequest(req, res) {
    try {
        const currentUserId = req.session.userId;
        const requesterId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(requesterId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        const currentUser = await User.findById(currentUserId);
        const requester = await User.findById(requesterId);

        if (!currentUser || !requester) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        const requestExists = currentUser.friendRequests.some(
            requestId => requestId.toString() === requesterId
        );

        if (!requestExists) {
            return res.status(404).json({
                success: false,
                message: "Friend request was not found."
            });
        }

        currentUser.friendRequests.pull(requester._id);
        currentUser.friends.addToSet(requester._id);
        requester.friends.addToSet(currentUser._id);

        await currentUser.save();
        await requester.save();

        return res.status(200).json({
            success: true,
            message: "Friend request accepted."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not accept friend request."
        });
    }
}

async function rejectFriendRequest(req, res) {
    try {
        const currentUser = await User.findById(req.session.userId);

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        const requesterId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(requesterId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        const requestExists = currentUser.friendRequests.some(
            requestId => requestId.toString() === requesterId
        );

        if (!requestExists) {
            return res.status(404).json({
                success: false,
                message: "Friend request was not found."
            });
        }

        currentUser.friendRequests.pull(requesterId);
        await currentUser.save();

        return res.status(200).json({
            success: true,
            message: "Friend request rejected."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not reject friend request."
        });
    }
}

async function removeFriend(req, res) {
    try {
        const currentUserId = req.session.userId;
        const friendId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        const currentUser = await User.findById(currentUserId);
        const friend = await User.findById(friendId);

        if (!currentUser || !friend) {
            return res.status(404).json({
                success: false,
                message: "User was not found."
            });
        }

        const areFriends = currentUser.friends.some(
            id => id.toString() === friendId
        );

        if (!areFriends) {
            return res.status(404).json({
                success: false,
                message: "This user is not in your friends list."
            });
        }

        currentUser.friends.pull(friend._id);
        friend.friends.pull(currentUser._id);

        await currentUser.save();
        await friend.save();

        return res.status(200).json({
            success: true,
            message: "Friend removed."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not remove friend."
        });
    }
}

module.exports = {
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
};