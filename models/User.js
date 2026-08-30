const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [
                true,
                "Username is required."
            ],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [
                3,
                "Username must contain at least 3 characters."
            ],
            maxlength: [
                20,
                "Username may contain at most 20 characters."
            ],
            match: [
                /^[a-zA-Z0-9._]+$/,
                "Username may contain letters, numbers, dots and underscores only."
            ]
        },

        email: {
            type: String,
            required: [
                true,
                "Email is required."
            ],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address."
            ]
        },

        password: {
            type: String,
            required: [
                true,
                "Password is required."
            ],
            minlength: [
                6,
                "Password must contain at least 6 characters."
            ],
            select: false
        },

        fullName: {
            type: String,
            trim: true,
            maxlength: [
                60,
                "Full name may contain at most 60 characters."
            ],
            default: ""
        },

        bio: {
            type: String,
            trim: true,
            maxlength: [
                150,
                "Bio may contain at most 150 characters."
            ],
            default: ""
        },

        profileImage: {
            type: String,
            trim: true,
            default: "images/BlankProfile.jpg"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);