const { validationResult } = require('express-validator')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../config/db')
const { calculateScore } = require('../utils/scoreCalculator')

function handleValidation (req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }
}

async function createQuiz (req, res, next) {
  const validationResponse = handleValidation(req, res)
  if (validationResponse) return validationResponse

  const { title, level, questions = [] } = req.body
  const userId = req.user.id
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const shareToken = uuidv4()
    const [quizResult] = await connection.execute(
      'INSERT INTO quizzes (title, level, user_id, share_token) VALUES (?, ?, ?, ?)',
      [title, level, userId, shareToken]
    )

    const quizId = quizResult.insertId

    for (const question of questions) {
      await connection.execute(
        'INSERT INTO questions (quiz_id, question_text, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?)',
        [quizId, question.questionText, JSON.stringify(question.options), question.correctAnswer, question.explanation || null]
      )
    }

    await connection.commit()
    return res.status(201).json({ success: true, quizId, shareToken })
  } catch (error) {
    await connection.rollback()
    return next(error)
  } finally {
    connection.release()
  }
}

async function updateQuiz (req, res, next) {
  const validationResponse = handleValidation(req, res)
  if (validationResponse) return validationResponse

  const quizId = req.params.quizId
  const { title, level, questions = [] } = req.body
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [quizRows] = await connection.execute('SELECT user_id FROM quizzes WHERE id = ?', [quizId])
    if (!quizRows.length) {
      await connection.rollback()
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }
    if (quizRows[0].user_id !== req.user.id) {
      await connection.rollback()
      return res.status(403).json({ success: false, message: 'You can only edit your quizzes' })
    }

    await connection.execute('UPDATE quizzes SET title = ?, level = ? WHERE id = ?', [title, level, quizId])
    await connection.execute('DELETE FROM questions WHERE quiz_id = ?', [quizId])

    for (const question of questions) {
      await connection.execute(
        'INSERT INTO questions (quiz_id, question_text, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?)',
        [quizId, question.questionText, JSON.stringify(question.options), question.correctAnswer, question.explanation || null]
      )
    }

    await connection.commit()
    return res.json({ success: true, quizId })
  } catch (error) {
    await connection.rollback()
    return next(error)
  } finally {
    connection.release()
  }
}

async function getQuizzesByLevel (req, res) {
  const { level } = req.params
  const [rows] = await pool.execute(
    `SELECT q.id, q.title, q.level, q.share_token, q.created_at, u.email AS owner
     FROM quizzes q
     LEFT JOIN users u ON q.user_id = u.id
     WHERE q.level = ?
     ORDER BY q.created_at DESC`,
    [level]
  )
  return res.json({ success: true, quizzes: rows })
}

async function getQuizById (req, res) {
  const { quizId } = req.params
  const [quizRows] = await pool.execute('SELECT * FROM quizzes WHERE id = ?', [quizId])
  if (!quizRows.length) {
    return res.status(404).json({ success: false, message: 'Quiz not found' })
  }
  const [questionRows] = await pool.execute('SELECT id, question_text, options, correct_answer, explanation FROM questions WHERE quiz_id = ?', [quizId])
  const questions = questionRows.map((question) => ({
    id: question.id,
    questionText: question.question_text,
    options: JSON.parse(question.options || '[]'),
    correctAnswer: question.correct_answer,
    explanation: question.explanation
  }))
  return res.json({ success: true, quiz: { ...quizRows[0], questions } })
}

async function getMyQuizzes (req, res) {
  const userId = req.user.id
  const [rows] = await pool.execute('SELECT id, title, level, share_token, created_at FROM quizzes WHERE user_id = ? ORDER BY created_at DESC', [userId])
  return res.json({ success: true, quizzes: rows })
}

async function getSharedQuiz (req, res) {
  const { token } = req.params
  const [quizRows] = await pool.execute('SELECT id, title, level FROM quizzes WHERE share_token = ?', [token])
  if (!quizRows.length) {
    return res.status(404).json({ success: false, message: 'Shared quiz not found' })
  }
  const quiz = quizRows[0]
  const [questionRows] = await pool.execute('SELECT id, question_text, options FROM questions WHERE quiz_id = ?', [quiz.id])
  const questions = questionRows.map((question) => ({
    id: question.id,
    questionText: question.question_text,
    options: JSON.parse(question.options || '[]')
  }))
  return res.json({ success: true, quiz: { ...quiz, questions } })
}

async function takeQuiz (req, res, next) {
  const validationResponse = handleValidation(req, res)
  if (validationResponse) return validationResponse

  const { quizId, answers = [] } = req.body
  const userId = req.user?.id || null
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [questions] = await connection.execute('SELECT id, correct_answer FROM questions WHERE quiz_id = ?', [quizId])
    if (!questions.length) {
      await connection.rollback()
      return res.status(404).json({ success: false, message: 'Quiz has no questions configured' })
    }

    const scoreDetails = calculateScore(questions, answers)

    const [attemptResult] = await connection.execute(
      'INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions) VALUES (?, ?, ?, ?)',
      [quizId, userId, scoreDetails.scorePercent, scoreDetails.totalQuestions]
    )

    const attemptId = attemptResult.insertId

    for (const item of scoreDetails.breakdown) {
      await connection.execute(
        'INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)',
        [attemptId, item.questionId, item.submittedAnswer, item.isCorrect]
      )
    }

    await connection.commit()

    return res.json({
      success: true,
      score: scoreDetails.scorePercent,
      correct: scoreDetails.correctCount,
      totalQuestions: scoreDetails.totalQuestions,
      breakdown: scoreDetails.breakdown,
      attemptId
    })
  } catch (error) {
    await connection.rollback()
    return next(error)
  } finally {
    connection.release()
  }
}

module.exports = {
  createQuiz,
  updateQuiz,
  getQuizzesByLevel,
  getQuizById,
  getMyQuizzes,
  getSharedQuiz,
  takeQuiz
}
