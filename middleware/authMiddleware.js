function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "You must log in first."
        });
    }

    next();
}

function requirePageLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login.html");
    }

    next();
}

function redirectIfLoggedIn(req, res, next) {
    if (req.session.userId) {
        return res.redirect("/feed.html");
    }

    next();
}

module.exports = {
    requireLogin,
    requirePageLogin,
    redirectIfLoggedIn
};