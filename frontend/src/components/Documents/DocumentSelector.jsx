import React from 'react'
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Alert,
} from '@mui/material'
import {
  Description as DocumentIcon,
  CheckCircle as ProcessedIcon,
  Schedule as ProcessingIcon,
} from '@mui/icons-material'

const DocumentSelector = ({ 
  documents, 
  selectedDocument, 
  onSelectDocument,
  showProcessingStatus = true 
}) => {
  if (!documents || documents.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Documents
        </Typography>
        <Alert severity="info">
          No documents uploaded yet. Upload your first PDF to get started!
        </Alert>
      </Paper>
    )
  }

  const processedDocuments = documents.filter(doc => doc.processed)
  const processingDocuments = documents.filter(doc => !doc.processed)

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Your Documents ({documents.length})
      </Typography>
      
      {processingDocuments.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {processingDocuments.length} document(s) processing...
        </Alert>
      )}
      
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {documents.map((document) => (
          <ListItem key={document.id} disablePadding>
            <ListItemButton
              selected={selectedDocument?.id === document.id}
              onClick={() => onSelectDocument(document)}
              sx={{
                mb: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedDocument?.id === document.id ? 'white' : 'inherit',
                }}
              >
                <DocumentIcon />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body1" noWrap sx={{ flex: 1 }}>
                      {document.title}
                    </Typography>
                    {showProcessingStatus && (
                      <Chip
                        icon={document.processed ? <ProcessedIcon /> : <ProcessingIcon />}
                        label={document.processed ? 'Ready' : 'Processing'}
                        size="small"
                        color={document.processed ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    {document.file_size_mb} MB • {document.page_count} pages
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default DocumentSelector