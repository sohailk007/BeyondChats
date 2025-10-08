import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Button,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material'
import { documentAPI } from '../../services/api'

const DocumentUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [recentUploads, setRecentUploads] = useState([])
  const [error, setError] = useState('')

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)
    setError('')

    try {
      for (const file of files) {
        // Validate file type
        if (file.type !== 'application/pdf') {
          setError('Please upload only PDF files')
          continue
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB')
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        const response = await documentAPI.upload(formData)
        
        clearInterval(progressInterval)
        setProgress(100)

        setRecentUploads(prev => [{
          id: response.data.id,
          name: file.name,
          uploadedAt: new Date().toLocaleString(),
          status: 'Processing...',
        }, ...prev.slice(0, 4)])

        if (onUploadSuccess) {
          onUploadSuccess(response.data)
        }

        // Reset progress for next file
        setTimeout(() => setProgress(0), 1000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.response?.data?.error || 'Error uploading file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteRecent = (index) => {
    setRecentUploads(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload PDF Documents
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          mb: 3,
          backgroundColor: 'grey.50',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.light',
          },
        }}
      >
        <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          Drag and drop PDF files here or click to browse
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Supported: PDF files (Max: 10MB per file)
        </Typography>
        
        <Button
          variant="contained"
          component="label"
          disabled={uploading}
          startIcon={<UploadIcon />}
        >
          Choose Files
          <input
            type="file"
            hidden
            multiple
            accept=".pdf"
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Uploading... {progress}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {recentUploads.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Recent Uploads
          </Typography>
          <List>
            {recentUploads.map((upload, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={() => handleDeleteRecent(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <DocumentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {upload.name}
                      {upload.status === 'Processing...' && (
                        <SuccessIcon color="success" fontSize="small" />
                      )}
                    </Box>
                  }
                  secondary={`Uploaded: ${upload.uploadedAt}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  )
}

export default DocumentUpload