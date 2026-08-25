const express = require('express')
const passport = require('passport')
const { body } = require('express-validator')
const { register, login, getProfile, handleGoogleCallback } = require('../controllers/authController')
const { authenticate } = require('../middleware/authMiddleware')
require('../config/passport')

const router = express.Router()

router.post(
  '/register',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  register
)

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  login
)

router.get('/me', authenticate, getProfile)

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google`
  }),
  handleGoogleCallback
)

module.exports = router
