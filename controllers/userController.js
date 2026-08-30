const bcrypt = require("bcryptjs");
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
        const identifier = String(
            req.body.identifier || ""
        )
            .trim()
            .toLowerCase();

        const password = String(
            req.body.password || ""
        );

        if (
            identifier === "" ||
            password === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Username/email and password are required."
            });
        }

        const user = await User.findOne({
            $or: [
                {
                    username: identifier
                },
                {
                    email: identifier
                }
            ]
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Incorrect username/email or password."
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
                createdAt: user.createdAt
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

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateCurrentUser,
    deleteCurrentUser
};