const { MongoClient } = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'social_network';

let database;

async function connectToDatabase() {
    const client = new MongoClient(connectionURL);

    await client.connect();

    database = client.db(databaseName);

    await database.collection('users').createIndex(
        { username: 1 },
        { unique: true }
    );

    await database.collection('users').createIndex(
        { email: 1 },
        { unique: true }
    );

    console.log('Connected to MongoDB');
}

function getDatabase() {
    return database;
}

module.exports = {
    connectToDatabase,
    getDatabase
};