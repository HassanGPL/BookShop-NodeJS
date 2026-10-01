const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login',
    check('email').isEmail().withMessage('Please enter a valid email').bail().normalizeEmail(),
    check('password').notEmpty().withMessage('Password is required'),
    authController.postLogin);

router.get('/signup', authController.getSignup);
router.post('/signup',
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please enter a valid email').bail().normalizeEmail().custom(async (value) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
            throw new Error('An account with that email already exists.');
        }
    }),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);


module.exports = router;