import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
} from '@mui/material'
import {
  TrendingUp as TrendingIcon,
  Quiz as QuizIcon,
  Description as DocumentIcon,
  Schedule as TimeIcon,
  Star as StarIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'

const ProgressDashboard = ({ progressData, stats }) => {
  const {
    total_documents = 0,
    total_quizzes = 0,
    total_questions = 0,
    overall_accuracy = 0,
    recent_sessions = 0,
    daily_stats = {},
    strengths = {},
    weaknesses = {},
  } = stats || {}

  const StatCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              borderRadius: 2,
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" fontWeight="700">
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="700">
        Learning Progress Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<DocumentIcon />}
            title="Documents"
            value={total_documents}
            subtitle="Total studied"
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<QuizIcon />}
            title="Quizzes"
            value={total_quizzes}
            subtitle="Attempts made"
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingIcon />}
            title="Accuracy"
            value={`${overall_accuracy}%`}
            subtitle="Overall performance"
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TimeIcon />}
            title="Sessions"
            value={recent_sessions}
            subtitle="Recent study sessions"
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Strengths */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Your Strengths
                </Typography>
              </Box>
              {Object.keys(strengths).length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(strengths).map(([topic, score]) => (
                    <Chip
                      key={topic}
                      label={`${topic} (${score}%)`}
                      color="success"
                      variant="filled"
                      size="medium"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  Complete more quizzes to identify your strengths.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Areas for Improvement */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Areas for Improvement
                </Typography>
              </Box>
              {Object.keys(weaknesses).length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(weaknesses).map(([topic, score]) => (
                    <Chip
                      key={topic}
                      label={`${topic} (${score}%)`}
                      color="warning"
                      variant="filled"
                      size="medium"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  Great job! Keep practicing to maintain your skills.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Document Progress */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Document Progress
              </Typography>
              {progressData && progressData.length > 0 ? (
                <List>
                  {progressData.map((progress) => (
                    <ListItem key={progress.id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="body1" fontWeight="600">
                              {progress.document_title}
                            </Typography>
                            <Chip 
                              label={`${progress.total_quizzes_taken} quizzes`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                              Accuracy: {progress.overall_score}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Completion: {Math.round(progress.completion_percentage)}%
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ width: 120, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progress.completion_percentage}
                          color={
                            progress.completion_percentage >= 80 ? 'success' :
                            progress.completion_percentage >= 60 ? 'warning' : 'error'
                          }
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 0.5 }}>
                          {Math.round(progress.completion_percentage)}%
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    No progress data available. Start by taking some quizzes!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProgressDashboard