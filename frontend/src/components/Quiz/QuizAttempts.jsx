import React from 'react'
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Card,
  CardContent,
  Grid,
} from '@mui/material'
import {
  Quiz as QuizIcon,
  EmojiEvents as TrophyIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'

const QuizAttempts = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Quiz Attempts Yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Complete your first quiz to see your attempts here.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'success'
    if (percentage >= 60) return 'warning'
    return 'error'
  }

  const getPerformanceIcon = (percentage) => {
    if (percentage >= 80) return <TrophyIcon color="success" />
    if (percentage >= 60) return <TimeIcon color="warning" />
    return <QuizIcon color="error" />
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Calculate statistics
  const totalAttempts = attempts.length
  const averageScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts
  const bestScore = Math.max(...attempts.map(attempt => attempt.percentage))

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight="700">
                {totalAttempts}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Attempts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="secondary" fontWeight="700">
                {Math.round(averageScore)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success" fontWeight="700">
                {Math.round(bestScore)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Best Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attempts Table */}
      <Paper>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="600">
            Quiz History ({attempts.length} attempts)
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quiz & Document</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell align="center">Performance</TableCell>
                <TableCell align="center">Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts.map((attempt) => (
                <TableRow 
                  key={attempt.id} 
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {attempt.quiz_title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {attempt.document_title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={attempt.quiz.quiz_type?.toUpperCase()} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(attempt.completed_at), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(attempt.completed_at), 'HH:mm')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="600">
                      {attempt.score}/{attempt.total_questions}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {getPerformanceIcon(attempt.percentage)}
                      <Chip 
                        label={`${attempt.percentage}%`}
                        color={getPerformanceColor(attempt.percentage)}
                        size="small"
                        variant="filled"
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {formatTime(attempt.time_taken)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default QuizAttempts