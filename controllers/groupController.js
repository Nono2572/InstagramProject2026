const Group = require("../models/Group");

async function createGroup(req, res) {
    try {
        const name = String(
            req.body.name || ""
        ).trim();

        const description = String(
            req.body.description || ""
        ).trim();

        const category = String(
            req.body.category || ""
        ).trim();

        const location = String(
            req.body.location || ""
        ).trim();


        if (
            name === "" ||
            category === ""
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Group name and category are required."
            });
        }


        const newGroup =
            await Group.create({
                name: name,

                description: description,

                category: category,

                location: location,

                owner: req.session.userId,

                members: [
                    req.session.userId
                ]
            });


        return res.status(201).json({
            success: true,

            message:
                "Group created successfully.",

            group: newGroup
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message:
                "Could not create the group."
        });
    }
}

async function getAllGroups(req, res) {
    try {
        const groups = await Group.find()
            .populate(
                "owner",
                "username fullName profileImage"
            )
            .sort({
                createdAt: -1
            });


        return res.status(200).json({
            success: true,
            groups: groups
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Could not load groups."
        });
    }
}

async function getGroupById(req, res) {
    try {
        const group =
            await Group.findById(
                req.params.id
            )
                .populate(
                    "owner",
                    "username fullName profileImage"
                )
                .populate(
                    "members",
                    "username fullName profileImage"
                );


        if (!group) {
            return res.status(404).json({
                success: false,
                message:
                    "Group was not found."
            });
        }


        return res.status(200).json({
            success: true,
            group: group
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid group."
        });
    }
}

async function searchGroups(req, res) {
    try {
        const name = String(
            req.query.name || ""
        ).trim();

        const category = String(
            req.query.category || ""
        ).trim();

        const location = String(
            req.query.location || ""
        ).trim();


        const query = {};


        if (name !== "") {
            query.name = {
                $regex: name,
                $options: "i"
            };
        }


        if (category !== "") {
            query.category = {
                $regex: category,
                $options: "i"
            };
        }


        if (location !== "") {
            query.location = {
                $regex: location,
                $options: "i"
            };
        }


        const groups =
            await Group.find(query)
                .populate(
                    "owner",
                    "username fullName"
                );


        return res.status(200).json({
            success: true,
            groups: groups
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Could not search groups."
        });
    }
}

async function searchGroups(req, res) {
    try {
        const name = String(
            req.query.name || ""
        ).trim();

        const category = String(
            req.query.category || ""
        ).trim();

        const location = String(
            req.query.location || ""
        ).trim();


        const query = {};


        if (name !== "") {
            query.name = {
                $regex: name,
                $options: "i"
            };
        }


        if (category !== "") {
            query.category = {
                $regex: category,
                $options: "i"
            };
        }


        if (location !== "") {
            query.location = {
                $regex: location,
                $options: "i"
            };
        }


        const groups =
            await Group.find(query)
                .populate(
                    "owner",
                    "username fullName"
                );


        return res.status(200).json({
            success: true,
            groups: groups
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Could not search groups."
        });
    }
}

async function leaveGroup(req, res) {
    try {
        const group =
            await Group.findById(
                req.params.id
            );


        if (!group) {
            return res.status(404).json({
                success: false,
                message:
                    "Group was not found."
            });
        }


        if (
            group.owner.toString() ===
            req.session.userId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "The group owner cannot leave the group."
            });
        }


        group.members =
            group.members.filter(
                memberId =>
                    memberId.toString() !==
                    req.session.userId
            );


        await group.save();


        return res.status(200).json({
            success: true,
            message:
                "You left the group successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Could not leave the group."
        });
    }
}

async function deleteGroup(req, res) {
    try {
        const group =
            await Group.findById(
                req.params.id
            );


        if (!group) {
            return res.status(404).json({
                success: false,
                message:
                    "Group was not found."
            });
        }


        if (
            group.owner.toString() !==
            req.session.userId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the group owner can delete this group."
            });
        }


        await Group.findByIdAndDelete(
            req.params.id
        );


        return res.status(200).json({
            success: true,
            message:
                "Group deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Could not delete the group."
        });
    }
}

async function joinGroup(req, res) {
    try {
        const group =
            await Group.findById(
                req.params.id
            );


        if (!group) {
            return res.status(404).json({
                success: false,
                message:
                    "Group was not found."
            });
        }


        const alreadyMember =
            group.members.some(
                memberId =>
                    memberId.toString() ===
                    req.session.userId
            );


        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message:
                    "You are already a member of this group."
            });
        }


        group.members.push(
            req.session.userId
        );

        await group.save();


        return res.status(200).json({
            success: true,
            message:
                "You joined the group successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                "Could not join the group."
        });
    }
}

async function updateGroup(req, res) {
    try {
        const group =
            await Group.findById(
                req.params.id
            );


        if (!group) {
            return res.status(404).json({
                success: false,
                message:
                    "Group was not found."
            });
        }


        if (
            group.owner.toString() !==
            req.session.userId
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the group owner can edit this group."
            });
        }


        if (req.body.name !== undefined) {
            group.name =
                String(
                    req.body.name
                ).trim();
        }


        if (
            req.body.description !==
            undefined
        ) {
            group.description =
                String(
                    req.body.description
                ).trim();
        }


        if (
            req.body.category !==
            undefined
        ) {
            group.category =
                String(
                    req.body.category
                ).trim();
        }


        if (
            req.body.location !==
            undefined
        ) {
            group.location =
                String(
                    req.body.location
                ).trim();
        }


        await group.save();


        return res.status(200).json({
            success: true,
            message:
                "Group updated successfully.",
            group: group
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                "Could not update the group."
        });
    }
}

module.exports = {
    createGroup,
    getAllGroups,
    getGroupById,
    searchGroups,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup
};