function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'You must login first'
        });
    }

    next();
}

function requireGuest(req, res, next) {
    if (req.session.userId) {
        return res.status(403).json({
            success: false,
            message: 'You are already logged in'
        });
    }

    next();
}

module.exports = {
    requireLogin,
    requireGuest
};