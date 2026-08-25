function calculateScore (questions, answers) {
  const answerMap = new Map()
  answers.forEach(({ questionId, selectedOption }) => {
    answerMap.set(Number(questionId), selectedOption)
  })

  let correctCount = 0
  const breakdown = questions.map((question) => {
    const submittedAnswer = answerMap.get(question.id) || null
    const isCorrect = submittedAnswer && submittedAnswer === question.correct_answer
    if (isCorrect) correctCount += 1
    return {
      questionId: question.id,
      correctAnswer: question.correct_answer,
      submittedAnswer,
      isCorrect
    }
  })

  const totalQuestions = questions.length
  const scorePercent = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100)

  return {
    correctCount,
    totalQuestions,
    scorePercent,
    breakdown
  }
}

module.exports = {
  calculateScore
}
