const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const { connectToDatabase } = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);

app.get('/', function (req, res) {
    res.redirect('/login.html');
});

app.use(function (req, res) {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(function (error, req, res, next) {
    console.log(error);

    res.status(500).json({
        success: false,
        message: 'Server error'
    });
});

connectToDatabase()
    .then(function () {
        app.listen(PORT, function () {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch(function (error) {
        console.log(error);
    });