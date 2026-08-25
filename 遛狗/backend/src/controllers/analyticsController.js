const { pool } = require('../config/db')

async function getProgressOverview (req, res) {
  const userId = req.user.id
  const [attempts] = await pool.execute(
    `SELECT qa.id as attemptId, qa.score, qa.total_questions, qa.created_at, q.title
     FROM quiz_attempts qa
     INNER JOIN quizzes q ON qa.quiz_id = q.id
     WHERE qa.user_id = ?
     ORDER BY qa.created_at DESC
     LIMIT 20`,
    [userId]
  )

  const quizzesTaken = attempts.length
  const averageScore = quizzesTaken
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / quizzesTaken)
    : 0

  return res.json({
    success: true,
    overview: {
      quizzesTaken,
      averageScore,
      attempts
    }
  })
}

async function getLeaderboard (req, res) {
  const { quizId } = req.params
  const [rows] = await pool.execute(
    `SELECT qa.id as attemptId, qa.score, qa.created_at, u.email
     FROM quiz_attempts qa
     LEFT JOIN users u ON qa.user_id = u.id
     WHERE qa.quiz_id = ?
     ORDER BY qa.score DESC, qa.created_at ASC
     LIMIT 20`,
    [quizId]
  )
  return res.json({ success: true, leaderboard: rows })
}

module.exports = {
  getProgressOverview,
  getLeaderboard
}
