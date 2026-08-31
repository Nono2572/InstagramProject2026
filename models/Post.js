const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: false
        },

        postType: {
            type: String,
            enum: ["image", "video", "text"],
            required: true
        },

        caption: {
            type: String,
            trim: true,
            default: ""
        },

        mediaUrl: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            trim: true,
            default: ""
        },

        likes: {
            type: Number,
            default: 0
        },

        commentsCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post", postSchema);