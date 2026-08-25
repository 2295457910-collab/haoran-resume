const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/authRoutes')
const quizRoutes = require('./routes/quizRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler')

const app = express()

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
    credentials: true
  })
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/analytics', analyticsRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
