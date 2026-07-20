const { ObjectId } = require('mongodb');
const { getDatabase } = require('../config/db');

function getUsersCollection() {
    return getDatabase().collection('users');
}

async function createUser(userData) {
    const result = await getUsersCollection().insertOne(userData);

    return findUserById(result.insertedId.toString());
}

async function findUserByUsername(username) {
    return getUsersCollection().findOne({
        username: username
    });
}

async function findUserByEmail(email) {
    return getUsersCollection().findOne({
        email: email
    });
}

async function findUserById(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getUsersCollection().findOne(
        {
            _id: new ObjectId(id)
        },
        {
            projection: {
                passwordHash: 0,
                passwordSalt: 0
            }
        }
    );
}

async function updateUser(id, updates) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    await getUsersCollection().updateOne(
        {
            _id: new ObjectId(id)
        },
        {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        }
    );

    return findUserById(id);
}

async function deleteUser(id) {
    if (!ObjectId.isValid(id)) {
        return false;
    }

    const result = await getUsersCollection().deleteOne({
        _id: new ObjectId(id)
    });

    return result.deletedCount === 1;
}

module.exports = {
    createUser,
    findUserByUsername,
    findUserByEmail,
    findUserById,
    updateUser,
    deleteUser
};