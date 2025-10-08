import React, { useState } from 'react'
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Box,
  Slider,
  Alert,
  Card,
  CardContent,
} from '@mui/material'
import {
  Quiz as QuizIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material'
import { quizAPI } from '../../services/api'

const QuizGenerator = ({ documents, onQuizGenerated }) => {
  const [selectedDocument, setSelectedDocument] = useState('')
  const [quizType, setQuizType] = useState('mcq')
  const [questionsCount, setQuestionsCount] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateQuiz = async () => {
    if (!selectedDocument) {
      setError('Please select a document')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const response = await quizAPI.generate({
        document_id: selectedDocument,
        quiz_type: quizType,
        questions_count: questionsCount,
        difficulty: difficulty,
      })
      
      onQuizGenerated(response.data)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate quiz. Please try again.')
      console.error('Quiz generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const processedDocuments = documents.filter(doc => doc.processed)

  const quizTypes = [
    { value: 'mcq', label: 'Multiple Choice', description: 'Test basic understanding with multiple choice questions' },
    { value: 'saq', label: 'Short Answer', description: 'Practice concise explanations with short answer questions' },
    { value: 'laq', label: 'Long Answer', description: 'Develop detailed understanding with comprehensive questions' },
  ]

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon />
        AI Quiz Generator
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Document</InputLabel>
            <Select
              value={selectedDocument}
              label="Select Document"
              onChange={(e) => setSelectedDocument(e.target.value)}
            >
              {processedDocuments.map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>
                  {doc.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {processedDocuments.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              No processed documents available. Please upload and process a PDF first.
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Quiz Type</InputLabel>
            <Select
              value={quizType}
              label="Quiz Type"
              onChange={(e) => setQuizType(e.target.value)}
            >
              {quizTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleGenerateQuiz}
            disabled={!selectedDocument || generating || processedDocuments.length === 0}
            sx={{ height: '56px' }}
            startIcon={generating ? null : <QuizIcon />}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ px: 2 }}>
            <Typography gutterBottom>
              Number of Questions: {questionsCount}
            </Typography>
            <Slider
              value={questionsCount}
              onChange={(e, newValue) => setQuestionsCount(newValue)}
              min={3}
              max={20}
              marks={[
                { value: 3, label: '3' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
        </Grid>

        {/* Quiz Type Cards */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Quiz Types:
          </Typography>
          <Grid container spacing={2}>
            {quizTypes.map((type) => (
              <Grid item xs={12} md={4} key={type.value}>
                <Card 
                  variant={quizType === type.value ? 'elevation' : 'outlined'}
                  sx={{ 
                    cursor: 'pointer',
                    border: quizType === type.value ? 2 : 1,
                    borderColor: quizType === type.value ? 'primary.main' : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    }
                  }}
                  onClick={() => setQuizType(type.value)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {type.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default QuizGenerator