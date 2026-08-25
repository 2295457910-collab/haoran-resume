const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { getUserByEmail, createLocalUser, mapUserRow } = require('../services/userService')

function buildToken (userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function sendValidationErrors (req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }
}

async function register (req, res) {
  const errorResponse = sendValidationErrors(req, res)
  if (errorResponse) return errorResponse

  const { email, password } = req.body
  const existing = await getUserByEmail(email)
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await createLocalUser({ email, passwordHash })
  const token = buildToken(user.id)

  return res.status(201).json({
    success: true,
    token,
    user
  })
}

async function login (req, res) {
  const errorResponse = sendValidationErrors(req, res)
  if (errorResponse) return errorResponse

  const { email, password } = req.body
  const user = await getUserByEmail(email)
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const token = buildToken(user.id)
  return res.json({ success: true, token, user: mapUserRow(user) })
}

async function getProfile (req, res) {
  return res.json({ success: true, user: req.user })
}

async function handleGoogleCallback (req, res) {
  if (!req.user) {
    return res.status(400).json({ success: false, message: 'Unable to authenticate with Google' })
  }
  const token = buildToken(req.user.id)
  const redirectBase = process.env.CLIENT_URL || 'http://localhost:5173'
  const url = new URL('/oauth/callback', redirectBase)
  url.searchParams.set('token', token)
  res.redirect(url.toString())
}

module.exports = {
  register,
  login,
  getProfile,
  handleGoogleCallback
}
