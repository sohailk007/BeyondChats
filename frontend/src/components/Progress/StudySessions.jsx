import React from 'react'
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Card,
  CardContent,
  Grid,
} from '@mui/material'
import {
  Schedule as TimeIcon,
  Quiz as QuizIcon,
  MenuBook as ReadIcon,
  RateReview as ReviewIcon,
  AccessTime as DurationIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'

const StudySessions = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <TimeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Study Sessions
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your study sessions will appear here when you start learning.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const getSessionIcon = (sessionType, quizType) => {
    if (sessionType === 'quiz') {
      return <QuizIcon />
    } else if (sessionType === 'reading') {
      return <ReadIcon />
    } else {
      return <ReviewIcon />
    }
  }

  const getSessionColor = (sessionType) => {
    switch (sessionType) {
      case 'quiz': return 'primary'
      case 'reading': return 'secondary'
      case 'review': return 'success'
      default: return 'default'
    }
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const calculateAccuracy = (correct, attempted) => {
    if (attempted === 0) return 0
    return Math.round((correct / attempted) * 100)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Recent Study Sessions
      </Typography>

      <List>
        {sessions.map((session, index) => (
          <ListItem 
            key={session.id} 
            divider={index < sessions.length - 1}
            sx={{ py: 2 }}
          >
            <ListItemIcon>
              {getSessionIcon(session.session_type, session.quiz_type)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                  <Typography variant="body1" fontWeight="600">
                    {session.document_title}
                  </Typography>
                  <Chip
                    icon={getSessionIcon(session.session_type, session.quiz_type)}
                    label={session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)}
                    color={getSessionColor(session.session_type)}
                    size="small"
                    variant="outlined"
                  />
                  {session.quiz_type && (
                    <Chip
                      label={session.quiz_type.toUpperCase()}
                      size="small"
                      variant="filled"
                    />
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon fontSize="small" />
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(session.start_time), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                  
                  {session.time_spent > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DurationIcon fontSize="small" />
                      <Typography variant="body2" color="textSecondary">
                        {formatDuration(session.time_spent)}
                      </Typography>
                    </Box>
                  )}

                  {session.questions_attempted > 0 && (
                    <Typography variant="body2" color="textSecondary">
                      {session.questions_attempted} questions • {session.correct_answers} correct
                      {session.questions_attempted > 0 && (
                        <span> ({calculateAccuracy(session.correct_answers, session.questions_attempted)}%)</span>
                      )}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Session Statistics */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="primary">
                {sessions.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="secondary">
                {sessions.filter(s => s.session_type === 'quiz').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Quiz Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="success">
                {Math.round(sessions.reduce((total, session) => total + session.time_spent, 0) / 3600)}h
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="warning">
                {sessions.reduce((total, session) => total + session.questions_attempted, 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Questions Attempted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default StudySessions