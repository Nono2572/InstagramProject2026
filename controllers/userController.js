const crypto = require('crypto');
const User = require('../models/userModel');

function createPasswordData(password) {
    const salt = crypto.randomBytes(16).toString('hex');

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString('hex');

    return {
        passwordSalt: salt,
        passwordHash: hash
    };
}

function checkPassword(password, salt, savedHash) {
    const currentHash = crypto.scryptSync(password, salt, 64);

    const savedHashBuffer = Buffer.from(savedHash, 'hex');

    if (currentHash.length !== savedHashBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        currentHash,
        savedHashBuffer
    );
}

async function register(req, res, next) {
    try {
        const fullName = req.body.fullName.trim();
        const username = req.body.username.trim().toLowerCase();
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'Username must contain between 3 and 20 characters'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 6 characters'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        const existingUsername =
            await User.findUserByUsername(username);

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const existingEmail =
            await User.findUserByEmail(email);

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const passwordData = createPasswordData(password);

        const user = await User.createUser({
            fullName: fullName,
            username: username,
            email: email,
            bio: '',
            profileImage: '',
            passwordSalt: passwordData.passwordSalt,
            passwordHash: passwordData.passwordHash,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        req.session.userId = user._id.toString();

        res.status(201).json({
            success: true,
            message: 'Registration completed successfully',
            user: user
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const username = req.body.username
            .trim()
            .toLowerCase();

        const password = req.body.password;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const user = await User.findUserByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect username or password'
            });
        }

        const passwordCorrect = checkPassword(
            password,
            user.passwordSalt,
            user.passwordHash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect username or password'
            });
        }

        req.session.userId = user._id.toString();

        res.json({
            success: true,
            message: 'Login completed successfully'
        });
    } catch (error) {
        next(error);
    }
}

function logout(req, res, next) {
    req.session.destroy(function (error) {
        if (error) {
            return next(error);
        }

        res.clearCookie('connect.sid');

        res.json({
            success: true,
            message: 'Logout completed successfully'
        });
    });
}

async function getMyProfile(req, res, next) {
    try {
        const user =
            await User.findUserById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        next(error);
    }
}

async function getPublicProfile(req, res, next) {
    try {
        const user =
            await User.findUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        next(error);
    }
}

async function updateMyProfile(req, res, next) {
    try {
        const fullName = req.body.fullName.trim();
        const bio = req.body.bio.trim();
        const profileImage =
            req.body.profileImage.trim();

        if (!fullName) {
            return res.status(400).json({
                success: false,
                message: 'Full name is required'
            });
        }

        if (bio.length > 300) {
            return res.status(400).json({
                success: false,
                message: 'Biography is too long'
            });
        }

        const user = await User.updateUser(
            req.session.userId,
            {
                fullName: fullName,
                bio: bio,
                profileImage: profileImage
            }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user
        });
    } catch (error) {
        next(error);
    }
}

async function deleteMyAccount(req, res, next) {
    try {
        const deleted =
            await User.deleteUser(req.session.userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        req.session.destroy(function (error) {
            if (error) {
                return next(error);
            }

            res.clearCookie('connect.sid');

            res.json({
                success: true,
                message: 'Account deleted successfully'
            });
        });
    } catch (error) {
        next(error);
    }
}

async function sessionStatus(req, res, next) {
    try {
        if (!req.session.userId) {
            return res.json({
                success: true,
                loggedIn: false
            });
        }

        const user =
            await User.findUserById(req.session.userId);

        res.json({
            success: true,
            loggedIn: true,
            user: user
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    logout,
    getMyProfile,
    getPublicProfile,
    updateMyProfile,
    deleteMyAccount,
    sessionStatus
};