const bcrypt = require('bcryptjs')
const { pool } = require('../config/db')

function mapUserRow (row) {
  if (!row) return null
  const { password, ...rest } = row
  return rest
}

async function getUserByEmail (email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email])
  return rows.length ? rows[0] : null
}

async function getUserById (id) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id])
  return rows.length ? rows[0] : null
}

async function getUserByGoogleId (googleId) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE google_id = ?', [googleId])
  return rows.length ? rows[0] : null
}

async function createLocalUser ({ email, passwordHash }) {
  const [result] = await pool.execute(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, passwordHash]
  )
  return { id: result.insertId, email }
}

async function attachGoogleIdToUser ({ userId, googleId }) {
  await pool.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, userId])
}

async function upsertGoogleUser ({ googleId, email }) {
  let user = await getUserByGoogleId(googleId)
  if (user) return mapUserRow(user)

  if (!user && email) {
    const existing = await getUserByEmail(email)
    if (existing) {
      await attachGoogleIdToUser({ userId: existing.id, googleId })
      return mapUserRow({ ...existing, google_id: googleId })
    }
  }

  const passwordSeed = await bcrypt.hash(googleId + Date.now(), 10)
  const [result] = await pool.execute(
    'INSERT INTO users (email, password, google_id) VALUES (?, ?, ?)',
    [email, passwordSeed, googleId]
  )
  return { id: result.insertId, email, google_id: googleId }
}

module.exports = {
  mapUserRow,
  getUserByEmail,
  getUserById,
  getUserByGoogleId,
  createLocalUser,
  attachGoogleIdToUser,
  upsertGoogleUser
}
