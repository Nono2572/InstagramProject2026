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
const weatherRoutes = require("./routes/weatherRoutes");
const Post = require("./models/Post");

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

/* =========================================================
   FACEBOOK SHARING
   ========================================================= */

app.get("/api/facebook/config", function (req, res) {
    res.json({
        success: true,
        appId: process.env.FACEBOOK_APP_ID || "",
        apiVersion: process.env.FACEBOOK_API_VERSION || "v26.0"
    });
});


function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


app.get("/share/post/:id", async function (req, res) {
    try {
        const post = await Post.findById(req.params.id)
            .populate(
                "author",
                "username fullName"
            );


        if (!post) {
            return res
                .status(404)
                .send("Post not found.");
        }


        const configuredBaseUrl =
            (
                process.env.PUBLIC_BASE_URL ||
                ""
            ).replace(/\/$/, "");


        const requestBaseUrl =
            req.protocol +
            "://" +
            req.get("host");


        const baseUrl =
            configuredBaseUrl ||
            requestBaseUrl;


        const shareUrl =
            baseUrl +
            "/share/post/" +
            post._id;


        const feedUrl =
            baseUrl +
            "/feed.html?post=" +
            post._id;


        const authorName =
            post.author
                ? (
                    post.author.username ||
                    post.author.fullName ||
                    "Instagram user"
                )
                : "Instagram user";


        const description =
            post.caption ||
            "View this post on Instagram Project.";


        let mediaMeta = "";


        if (post.mediaUrl) {

            const absoluteMediaUrl =
                post.mediaUrl.startsWith("http")
                    ? post.mediaUrl
                    : baseUrl + post.mediaUrl;


            if (post.postType === "image") {

                mediaMeta =
                    '<meta property="og:image" content="' +
                    escapeHtml(absoluteMediaUrl) +
                    '">';
            }


            if (post.postType === "video") {

                mediaMeta =
                    '<meta property="og:video" content="' +
                    escapeHtml(absoluteMediaUrl) +
                    '">';
            }
        }


        res.type("html").send(`
<!doctype html>

<html lang="en">

<head>

    <meta charset="utf-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >

    <title>
        ${escapeHtml(authorName)} - Shared post
    </title>

    <meta
        property="og:type"
        content="article"
    >

    <meta
        property="og:title"
        content="Post by ${escapeHtml(authorName)}"
    >

    <meta
        property="og:description"
        content="${escapeHtml(description)}"
    >

    <meta
        property="og:url"
        content="${escapeHtml(shareUrl)}"
    >

    ${mediaMeta}

</head>

<body>

    <p>Opening the post...</p>

    <script>
        window.location.replace(
            ${JSON.stringify(feedUrl)}
        );
    <\/script>

</body>

</html>
        `);

    } catch (error) {

        console.error(
            "Facebook share page error:",
            error
        );

        res
            .status(400)
            .send("Invalid post.");
    }
});

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
app.use(
    "/api/weather",
    weatherRoutes
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