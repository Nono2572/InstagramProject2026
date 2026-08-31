async function getWeather(req, res) {
    try {
        const city = String(
            req.query.city || ""
        ).trim();

        if (city === "") {
            return res.status(400).json({
                success: false,
                message: "City is required."
            });
        }

        // Step 1: Convert city name to coordinates
        const geoResponse = await fetch(
            "https://geocoding-api.open-meteo.com/v1/search" +
            "?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json"
        );

        const geoData =
            await geoResponse.json();

        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message: "Location was not found."
            });
        }

        const location =
            geoData.results[0];

        const latitude =
            location.latitude;

        const longitude =
            location.longitude;

        const weatherResponse =
            await fetch(
                "https://api.open-meteo.com/v1/forecast" +
                "?latitude=" + latitude +
                "&longitude=" + longitude +
                "&current=" +
                "temperature_2m," +
                "relative_humidity_2m," +
                "apparent_temperature," +
                "weather_code," +
                "wind_speed_10m" +
                "&timezone=auto"
            );

        const weatherData =
            await weatherResponse.json();

        if (!weatherResponse.ok) {
            return res.status(500).json({
                success: false,
                message:
                    "Weather service failed."
            });
        }

        return res.status(200).json({
            success: true,

            location: {
                name: location.name,
                country: location.country,
                latitude: latitude,
                longitude: longitude
            },

            weather: weatherData.current
        });

    } catch (error) {
        console.error(
            "Weather error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not load weather."
        });
    }
}

module.exports = {
    getWeather
};