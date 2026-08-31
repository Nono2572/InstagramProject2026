const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [
                true,
                "Group name is required."
            ],
            trim: true,
            minlength: [
                3,
                "Group name must contain at least 3 characters."
            ],
            maxlength: [
                50,
                "Group name may contain at most 50 characters."
            ]
        },

        description: {
            type: String,
            trim: true,
            maxlength: [
                300,
                "Description may contain at most 300 characters."
            ],
            default: ""
        },

        category: {
            type: String,
            required: [
                true,
                "Category is required."
            ],
            trim: true
        },

        location: {
            type: String,
            trim: true,
            default: ""
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Group",
    groupSchema
);