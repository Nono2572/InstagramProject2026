require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const {
    connectToDatabase
} = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");

const {
    requirePageLogin,
    redirectIfLoggedIn
} = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;
const postRoutes = require("./routes/PostRoutes");
app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "my-secret-key",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60,
            sameSite: "lax"
        }
    })
);

app.get(
    ["/", "/login.html"],
    redirectIfLoggedIn,

    function (req, res) {
        res.sendFile(
            path.join(
                __dirname,
                "public",
                "login.html"
            )
        );
    }
);

app.get(
    "/register.html",
    redirectIfLoggedIn,

    function (req, res) {
        res.sendFile(
            path.join(
                __dirname,
                "public",
                "register.html"
            )
        );
    }
);

app.get(
    "/feed.html",
    requirePageLogin,

    function (req, res) {
        res.sendFile(
            path.join(
                __dirname,
                "public",
                "feed.html"
            )
        );
    }
);

app.get(
    "/profile.html",
    requirePageLogin,

    function (req, res) {
        res.sendFile(
            path.join(
                __dirname,
                "public",
                "profile.html"
            )
        );
    }
);

app.get(
    "/edit-profile.html",
    requirePageLogin,

    function (req, res) {
        res.sendFile(
            path.join(
                __dirname,
                "public",
                "edit-profile.html"
            )
        );
    }
);

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);

app.use(
    "/api/users",
    userRoutes
);
app.use(
    "/api/posts",
    postRoutes
);
app.use(
    "/api/groups",
    groupRoutes
);

app.use(function (req, res) {
    res.status(404).json({
        success: false,
        message: "Route was not found."
    });
});

app.use(function (
    error,
    req,
    res,
    next
) {
    console.error(error);

    res.status(500).json({
        success: false,
        message: "An unexpected server error occurred."
    });
});

async function startServer() {
    await connectToDatabase();

    app.listen(
        PORT,

        function () {
            console.log(
                "Server is running on http://localhost:" +
                PORT
            );
        }
    );
}

startServer();