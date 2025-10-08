import React from 'react'
import { Alert, Box, Button } from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'

const ErrorMessage = ({ message, onRetry, severity = 'error' }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Alert 
        severity={severity}
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              <RefreshIcon sx={{ mr: 1 }} />
              Retry
            </Button>
          )
        }
      >
        {message || 'An error occurred. Please try again.'}
      </Alert>
    </Box>
  )
}

export default ErrorMessage