const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const registerRules = [body('name').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 })];
const loginRules    = [body('email').isEmail().normalizeEmail(), body('password').notEmpty()];

router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.get ('/me',              protect, getMe);
router.put ('/profile',         protect, updateProfile);
router.put ('/change-password', protect, changePassword);
router.post('/logout',          protect, logout);

module.exports = router;
