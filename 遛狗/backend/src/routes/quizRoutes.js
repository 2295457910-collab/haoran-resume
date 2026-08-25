const express = require('express')
const { body } = require('express-validator')
const {
  createQuiz,
  updateQuiz,
  getQuizzesByLevel,
  getQuizById,
  getMyQuizzes,
  getSharedQuiz,
  takeQuiz
} = require('../controllers/quizController')
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware')

const router = express.Router()

const questionValidators = [
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.questionText').notEmpty().withMessage('Question text is required'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('Each question needs at least two options'),
  body('questions.*.correctAnswer').notEmpty().withMessage('Provide a correct answer for each question')
]

router.post(
  '/create',
  authenticate,
  [body('title').notEmpty(), body('level').isIn(['Easy', 'Medium', 'Hard']), ...questionValidators],
  createQuiz
)

router.put(
  '/edit/:quizId',
  authenticate,
  [body('title').notEmpty(), body('level').isIn(['Easy', 'Medium', 'Hard']), ...questionValidators],
  updateQuiz
)

router.get('/my', authenticate, getMyQuizzes)
router.get('/level/:level', optionalAuthenticate, getQuizzesByLevel)
router.get('/share/:token', getSharedQuiz)
router.get('/:quizId', optionalAuthenticate, getQuizById)

router.post(
  '/take',
  authenticate,
  [body('quizId').isInt({ min: 1 }), body('answers').isArray()],
  takeQuiz
)

module.exports = router
