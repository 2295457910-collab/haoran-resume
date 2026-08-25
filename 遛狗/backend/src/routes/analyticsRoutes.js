const express = require('express')
const { getProgressOverview, getLeaderboard } = require('../controllers/analyticsController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/progress', authenticate, getProgressOverview)
router.get('/leaderboard/:quizId', authenticate, getLeaderboard)

module.exports = router
