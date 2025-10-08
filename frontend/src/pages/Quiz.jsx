import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
} from '@mui/material'
import { documentAPI, quizAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import QuizGenerator from '../components/Quiz/QuizGenerator'
import MCQQuiz from '../components/Quiz/MCQQuiz'
import SAQQuiz from '../components/Quiz/SAQQuiz'
import LAQQuiz from '../components/Quiz/LAQQuiz'
import QuizResults from '../components/Quiz/QuizResults'
import QuizAttempts from '../components/Quiz/QuizAttempts'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import ErrorMessage from '../components/Common/ErrorMessage'

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`quiz-tabpanel-${index}`}
    aria-labelledby={`quiz-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
)

const Quiz = () => {
  const [tabValue, setTabValue] = useState(0)
  const [documents, setDocuments] = useState([])
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [quizAttempt, setQuizAttempt] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const { data: documentsData, loading: documentsLoading, error: documentsError } = useApi(() => documentAPI.getAll())
  const { data: attemptsData, refetch: refetchAttempts } = useApi(() => quizAPI.getAttempts())

  useEffect(() => {
    if (documentsData) {
      setDocuments(documentsData)
    }
  }, [documentsData])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleQuizGenerated = async (quiz) => {
    setCurrentQuiz(quiz)
    setShowResults(false)
    setQuizAttempt(null)
    
    try {
      const response = await quizAPI.createAttempt(quiz.id)
      setQuizAttempt(response.data)
    } catch (error) {
      console.error('Error creating quiz attempt:', error)
    }
  }

  const handleQuizComplete = async (answers) => {
    try {
      const answerList = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer: answer,
        time_taken: 0,
      }))

      const response = await quizAPI.submitAttempt(quizAttempt.id, {
        answers: answerList,
        time_taken: 300,
      })

      setQuizAttempt(prev => ({ ...prev, ...response.data }))
      setShowResults(true)
      refetchAttempts()
    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
  }

  const handleRetakeQuiz = () => {
    setCurrentQuiz(null)
    setQuizAttempt(null)
    setShowResults(false)
  }

  if (documentsLoading) {
    return <LoadingSpinner message="Loading documents..." />
  }

  if (documentsError) {
    return (
      <Container>
        <ErrorMessage 
          message={documentsError || 'Failed to load documents'} 
          onRetry={() => window.location.reload()} 
        />
      </Container>
    )
  }

  const processedDocuments = documents.filter(doc => doc.processed)

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="700">
        Quiz Center
      </Typography>

      {processedDocuments.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No processed documents available. Please upload and process a PDF first to generate quizzes.
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Generate Quiz" />
          <Tab label="Quiz History" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {!currentQuiz ? (
            <QuizGenerator
              documents={documents}
              onQuizGenerated={handleQuizGenerated}
            />
          ) : showResults ? (
            <QuizResults
              attempt={quizAttempt}
              quiz={currentQuiz}
              onRetake={handleRetakeQuiz}
            />
          ) : (
            <Box>
              {currentQuiz.quiz_type === 'mcq' && (
                <MCQQuiz
                  questions={currentQuiz.questions}
                  onComplete={handleQuizComplete}
                />
              )}
              {currentQuiz.quiz_type === 'saq' && (
                <SAQQuiz
                  questions={currentQuiz.questions}
                  onComplete={handleQuizComplete}
                />
              )}
              {currentQuiz.quiz_type === 'laq' && (
                <LAQQuiz
                  questions={currentQuiz.questions}
                  onComplete={handleQuizComplete}
                />
              )}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <QuizAttempts attempts={attemptsData || []} />
        </TabPanel>
      </Paper>
    </Container>
  )
}

export default Quiz