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
            default: null
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

        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        commentsCount: {
            type: Number,
            default: 0
        },

        comments: [
            {
                author: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                text: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 300
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
        },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post", postSchema);