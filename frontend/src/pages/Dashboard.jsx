import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
} from '@mui/material'
import {
  Description as DocumentIcon,
  Quiz as QuizIcon,
  TrendingUp as ProgressIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  School as LearnIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { documentAPI, quizAPI, progressAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({})

  const { data: documents, loading: documentsLoading } = useApi(() => documentAPI.getAll())
  const { data: attempts } = useApi(() => quizAPI.getAttempts())
  const { data: progressStats } = useApi(() => progressAPI.getProgressStats())

  useEffect(() => {
    if (progressStats) {
      setStats(progressStats)
    }
  }, [progressStats])

  const quickActions = [
    {
      title: 'Upload Document',
      description: 'Add new PDF documents to study',
      icon: <UploadIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/documents'),
      color: 'primary',
    },
    {
      title: 'Take Quiz',
      description: 'Test your knowledge with AI-generated quizzes',
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/quiz'),
      color: 'secondary',
    },
    {
      title: 'View Progress',
      description: 'Track your learning journey and analytics',
      icon: <ProgressIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/progress'),
      color: 'success',
    },
  ]

  const recentAttempts = attempts?.slice(0, 3) || []

  if (documentsLoading) {
    return <LoadingSpinner />
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="700">
          Welcome back, {user?.username || 'Student'}! 👋
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          Ready to continue your learning journey?
        </Typography>
        
        {(!documents || documents.length === 0) && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Get started by uploading your first PDF document. We support NCERT Physics textbooks and other educational materials.
          </Alert>
        )}
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                height: '100%',
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    color: `${action.color}.main`,
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  {action.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Recent Activity
            </Typography>
            
            {recentAttempts.length > 0 ? (
              <Box>
                {recentAttempts.map((attempt, index) => (
                  <Box
                    key={attempt.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: 'grey.50',
                      border: 1,
                      borderColor: 'grey.200',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {attempt.quiz_title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {attempt.document_title} • Score: {attempt.score}/{attempt.total_questions} ({attempt.percentage}%)
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => navigate('/quiz')}
                  sx={{ mt: 2 }}
                >
                  View All Attempts
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  No recent activity. Start by taking your first quiz!
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  variant="outlined" 
                  onClick={() => navigate('/quiz')}
                >
                  Take Your First Quiz
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Stats & Tips */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Quick Stats
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Documents:</Typography>
                <Typography variant="body2" fontWeight="600">
                  {documents?.length || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Quizzes Taken:</Typography>
                <Typography variant="body2" fontWeight="600">
                  {attempts?.length || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Accuracy:</Typography>
                <Typography variant="body2" fontWeight="600">
                  {stats.overall_accuracy || 0}%
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom fontWeight="600">
              Learning Tips
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" gutterBottom>
                Start with Multiple Choice quizzes to test basic understanding
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Review incorrect answers to learn from mistakes
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Use different quiz types to develop various skills
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Track your progress to identify strengths and weaknesses
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard