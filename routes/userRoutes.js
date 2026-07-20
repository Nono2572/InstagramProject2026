const express = require('express');

const userController =
    require('../controllers/userController');

const {
    requireLogin,
    requireGuest
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
    '/register',
    requireGuest,
    userController.register
);

router.post(
    '/login',
    requireGuest,
    userController.login
);

router.post(
    '/logout',
    requireLogin,
    userController.logout
);

router.get(
    '/session',
    userController.sessionStatus
);

router.get(
    '/me',
    requireLogin,
    userController.getMyProfile
);

router.get(
    '/:id',
    requireLogin,
    userController.getPublicProfile
);

router.put(
    '/me',
    requireLogin,
    userController.updateMyProfile
);

router.delete(
    '/me',
    requireLogin,
    userController.deleteMyAccount
);

module.exports = router;