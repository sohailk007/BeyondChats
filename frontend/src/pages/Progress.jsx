import React from 'react'
import {
  Container,
  Typography,
  Box,
} from '@mui/material'
import { progressAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import ProgressDashboard from '../components/Progress/ProgressDashboard'
import ProgressChart from '../components/Progress/ProgressChart'
import StudySessions from '../components/Progress/StudySessions'
import LearningGoals from '../components/Progress/LearningGoals'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import ErrorMessage from '../components/Common/ErrorMessage'

const Progress = () => {
  const { data: progressData, loading: progressLoading, error: progressError } = 
    useApi(() => progressAPI.getProgressOverview())
  
  const { data: statsData, loading: statsLoading, error: statsError } = 
    useApi(() => progressAPI.getProgressStats())

  const { data: sessionsData } = useApi(() => progressAPI.getStudySessions())
  const { data: goalsData } = useApi(() => progressAPI.getLearningGoals())

  if (progressLoading || statsLoading) {
    return <LoadingSpinner message="Loading your progress data..." />
  }

  if (progressError || statsError) {
    return (
      <Container>
        <ErrorMessage 
          message={progressError || statsError || 'Failed to load progress data'} 
          onRetry={() => window.location.reload()} 
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="700">
        Learning Progress & Analytics
      </Typography>

      <Box sx={{ mb: 4 }}>
        <ProgressDashboard 
          progressData={progressData?.progress_data} 
          stats={statsData} 
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <ProgressChart dailyStats={statsData?.daily_stats} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <StudySessions sessions={sessionsData || []} />
      </Box>

      <Box>
        <LearningGoals goals={goalsData || []} />
      </Box>
    </Container>
  )
}

export default Progress