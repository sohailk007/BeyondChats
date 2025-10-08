import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Alert,
} from '@mui/material'
import {
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  EmojiEvents as TrophyIcon,
  Replay as RetryIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const QuizResults = ({ attempt, quiz, onRetake }) => {
  const navigate = useNavigate()
  
  if (!attempt) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No quiz results available</Typography>
      </Paper>
    )
  }

  const { score, total_questions, percentage, user_answers, time_taken } = attempt
  const correctAnswers = user_answers?.filter(answer => answer.is_correct).length || score

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'success'
    if (percentage >= 70) return 'warning'
    return 'error'
  }

  const getPerformanceText = (percentage) => {
    if (percentage >= 90) return 'Outstanding! 🎉'
    if (percentage >= 80) return 'Excellent! 👏'
    if (percentage >= 70) return 'Great Job! 👍'
    if (percentage >= 60) return 'Good Work! 💪'
    if (percentage >= 50) return 'Not Bad! 😊'
    return 'Keep Practicing! 📚'
  }

  const getPerformanceSubtext = (percentage) => {
    if (percentage >= 90) return 'You have mastered this material!'
    if (percentage >= 70) return 'You have a strong understanding of the content.'
    if (percentage >= 50) return 'You have a good foundation, keep learning!'
    return 'Review the material and try again for better results.'
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <Paper sx={{ p: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <TrophyIcon sx={{ fontSize: 64, color: `${getPerformanceColor(percentage)}.main`, mb: 2 }} />
        <Typography variant="h3" gutterBottom fontWeight="700">
          {getPerformanceText(percentage)}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {getPerformanceSubtext(percentage)}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Quiz: {quiz?.title}
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h2" component="div" color={getPerformanceColor(percentage)} fontWeight="700">
                {percentage}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overall Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h2" component="div" fontWeight="700">
                {correctAnswers}/{total_questions}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Correct Answers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h2" component="div" fontWeight="700">
                {formatTime(time_taken)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Time Taken
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h2" component="div" fontWeight="700" textTransform="uppercase">
                {quiz?.difficulty}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Difficulty
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Breakdown */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          Performance Breakdown
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={getPerformanceColor(percentage)}
            sx={{ 
              flexGrow: 1, 
              height: 12, 
              borderRadius: 6,
            }}
          />
          <Typography variant="body2" fontWeight="600" minWidth={60}>
            {percentage}%
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="textSecondary">
            Needs Improvement
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Excellent
          </Typography>
        </Box>
      </Box>

      {/* Question Review */}
      {user_answers && user_answers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="600">
            Question Review
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Review your answers to understand where you can improve.
          </Alert>
          <List sx={{ bgcolor: 'background.paper' }}>
            {user_answers.map((userAnswer, index) => (
              <React.Fragment key={userAnswer.id}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {userAnswer.is_correct ? (
                        <CorrectIcon color="success" />
                      ) : (
                        <IncorrectIcon color="error" />
                      )}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" gutterBottom fontWeight="500">
                        Q{index + 1}: {userAnswer.question_text}
                      </Typography>
                      
                      <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`Your answer: ${userAnswer.user_answer}`}
                          variant="outlined"
                          size="small"
                          color={userAnswer.is_correct ? 'success' : 'error'}
                        />
                        {!userAnswer.is_correct && userAnswer.correct_answer && (
                          <Chip
                            label={`Correct: ${userAnswer.correct_answer}`}
                            variant="outlined"
                            size="small"
                            color="success"
                          />
                        )}
                      </Box>
                      
                      {userAnswer.feedback && (
                        <Alert 
                          severity={userAnswer.is_correct ? "success" : "error"} 
                          sx={{ mt: 1 }}
                          icon={false}
                        >
                          <Typography variant="body2">
                            {userAnswer.feedback}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                {index < user_answers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onRetake && (
          <Button 
            variant="contained" 
            size="large" 
            onClick={onRetake}
            startIcon={<RetryIcon />}
          >
            Take Another Quiz
          </Button>
        )}
        <Button 
          variant="outlined" 
          size="large" 
          onClick={() => navigate('/quiz')}
          startIcon={<HomeIcon />}
        >
          Back to Quiz Center
        </Button>
      </Box>
    </Paper>
  )
}

export default QuizResults