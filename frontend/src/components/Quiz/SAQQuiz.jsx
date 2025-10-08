import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material'
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Send as SubmitIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material'

const SAQQuiz = ({ questions, onComplete, readOnly = false, userAnswers = {} }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(userAnswers)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    if (!readOnly) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [readOnly])

  const handleAnswerChange = (questionId, answer) => {
    if (readOnly) return
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    if (onComplete) {
      onComplete(answers)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  if (!questions || questions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No questions available</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6">
            Question {currentQuestion + 1} of {questions.length}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {question.topic && `Topic: ${question.topic}`}
          </Typography>
        </Box>
        
        {!readOnly && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={`Time: ${formatTime(timeSpent)}`} 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={`${answeredCount}/${questions.length} answered`} 
              color={answeredCount === questions.length ? "success" : "default"}
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ mb: 3, height: 8, borderRadius: 4 }}
      />

      {/* Question Card */}
      <Card sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.4 }}>
            {question.question_text}
          </Typography>

          {!readOnly && (
            <Alert severity="info" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TipIcon sx={{ mr: 1 }} />
              Provide a concise answer (2-3 sentences) that addresses the key points of the question.
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            placeholder={readOnly ? "Your answer will appear here..." : "Type your answer here (2-3 sentences focusing on key concepts)..."}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={readOnly}
            sx={{ mt: 2 }}
            InputProps={{
              sx: {
                fontSize: '1rem',
                lineHeight: 1.5,
              }
            }}
          />

          {readOnly && (
            <Box sx={{ mt: 3 }}>
              {question.expected_answer && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom color="success.dark">
                    Expected Answer:
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    {question.expected_answer}
                  </Typography>
                </Box>
              )}
              
              {question.explanation && (
                <Box sx={{ p: 2, backgroundColor: 'primary.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom color="primary.dark">
                    Explanation:
                  </Typography>
                  <Typography variant="body2" color="primary.dark">
                    {question.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outlined"
          startIcon={<PrevIcon />}
        >
          Previous
        </Button>

        {currentQuestion < questions.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={<NextIcon />}
          >
            Next Question
          </Button>
        ) : (
          !readOnly && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="success"
              startIcon={<SubmitIcon />}
              disabled={answeredCount < questions.length}
            >
              Submit Quiz
            </Button>
          )
        )}
      </Box>

      {/* Question Navigation Dots */}
      {!readOnly && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          {questions.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentQuestion(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: currentQuestion === index ? 'primary.main' : 
                                answers[questions[index].id] ? 'success.main' : 'grey.400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.2)',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Paper>
  )
}

export default SAQQuiz