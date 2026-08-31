const express = require("express");

const {
    getWeather
} = require(
    "../controllers/weatherController"
);

const {
    requireLogin
} = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.get(
    "/",
    requireLogin,
    getWeather
);

module.exports = router;