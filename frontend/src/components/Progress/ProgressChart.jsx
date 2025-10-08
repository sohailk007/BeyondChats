import React from 'react'
import {
  Paper,
  Typography,
  Box,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const ProgressChart = ({ dailyStats }) => {
  // Transform daily stats for charts
  const chartData = Object.entries(dailyStats || {}).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    quizzes: data.quizzes || 0,
    averageScore: data.average_score || 0,
  }))

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Learning Progress
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Complete some quizzes to see your progress charts.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Learning Progress (Last 7 Days)
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Quizzes per Day */}
        <Box sx={{ height: 300 }}>
          <Typography variant="subtitle1" gutterBottom color="textSecondary">
            Daily Quiz Activity
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quizzes" fill="#8884d8" name="Quizzes Taken" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Average Score Trend */}
        <Box sx={{ height: 300 }}>
          <Typography variant="subtitle1" gutterBottom color="textSecondary">
            Average Score Trend
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageScore" 
                stroke="#82ca9d" 
                name="Average Score %"
                strokeWidth={3}
                dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  )
}

export default ProgressChart