const jwt = require('jsonwebtoken')
const { getUserById, mapUserRow } = require('../services/userService')

async function authenticate (req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token missing' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await getUserById(decoded.id)
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found for token' })
    }
    req.user = mapUserRow(user)
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

async function optionalAuthenticate (req, _res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await getUserById(decoded.id)
    if (user) {
      req.user = mapUserRow(user)
    }
  } catch (error) {
    // ignore errors for optional auth path
  } finally {
    next()
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate
}
