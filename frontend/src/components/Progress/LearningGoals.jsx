import React, { useState } from 'react'
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material'
import {
  Flag as GoalIcon,
  Add as AddIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material'
import { progressAPI } from '../../services/api'

const LearningGoals = ({ goals }) => {
  const [open, setOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: '',
    document: '',
    target_score: 80,
  })

  const handleCreateGoal = async () => {
    try {
      await progressAPI.createLearningGoal(newGoal)
      setOpen(false)
      setNewGoal({
        title: '',
        description: '',
        target_date: '',
        document: '',
        target_score: 80,
      })
      // Refresh goals - you might want to add a refetch function
      window.location.reload()
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const getDaysRemaining = (targetDate) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getGoalStatus = (goal) => {
    if (goal.completed) return 'completed'
    const daysRemaining = getDaysRemaining(goal.target_date)
    if (daysRemaining < 0) return 'overdue'
    if (daysRemaining <= 7) return 'urgent'
    return 'active'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'overdue': return 'error'
      case 'urgent': return 'warning'
      default: return 'primary'
    }
  }

  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <GoalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Learning Goals
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Set learning goals to track your progress and stay motivated.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Create Your First Goal
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          Learning Goals
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          New Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {goals.map((goal) => {
          const status = getGoalStatus(goal)
          const daysRemaining = getDaysRemaining(goal.target_date)
          const progressPercentage = Math.min((goal.current_progress / goal.target_score) * 100, 100)

          return (
            <Grid item xs={12} md={6} key={goal.id}>
              <Card 
                variant={status === 'completed' ? 'elevated' : 'outlined'}
                sx={{ 
                  border: status === 'overdue' ? 2 : 1,
                  borderColor: status === 'overdue' ? 'error.main' : 'divider',
                  height: '100%',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      {status === 'completed' ? (
                        <CompletedIcon color="success" />
                      ) : (
                        <PendingIcon color="action" />
                      )}
                      <Typography variant="h6" component="div" noWrap>
                        {goal.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        status === 'completed' ? 'Completed' :
                        status === 'overdue' ? 'Overdue' :
                        status === 'urgent' ? 'Urgent' : 'Active'
                      }
                      color={getStatusColor(status)}
                      size="small"
                    />
                  </Box>

                  {goal.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {goal.description}
                    </Typography>
                  )}

                  {goal.document_title && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Document: <strong>{goal.document_title}</strong>
                    </Typography>
                  )}

                  {/* Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Progress: {goal.current_progress.toFixed(1)}/{goal.target_score}
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {Math.round(progressPercentage)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      color={getStatusColor(status)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Deadline */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={
                        status === 'overdue' ? 'error' :
                        status === 'urgent' ? 'warning' : 'textSecondary'
                      }
                      fontWeight={status === 'urgent' ? 600 : 400}
                    >
                      {status === 'completed' ? 'Completed' :
                       status === 'overdue' ? `${Math.abs(daysRemaining)} days overdue` :
                       `${daysRemaining} days remaining`}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Create Goal Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Learning Goal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Goal Title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Target Date"
              type="date"
              value={newGoal.target_date}
              onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Target Score</InputLabel>
              <Select
                value={newGoal.target_score}
                label="Target Score"
                onChange={(e) => setNewGoal({ ...newGoal, target_score: e.target.value })}
              >
                <MenuItem value={60}>60% - Passing</MenuItem>
                <MenuItem value={70}>70% - Good</MenuItem>
                <MenuItem value={80}>80% - Very Good</MenuItem>
                <MenuItem value={90}>90% - Excellent</MenuItem>
                <MenuItem value={100}>100% - Perfect</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateGoal} 
            variant="contained"
            disabled={!newGoal.title || !newGoal.target_date}
          >
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LearningGoals