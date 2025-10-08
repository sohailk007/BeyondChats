import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { documentAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import DocumentUpload from '../components/Documents/DocumentUpload'
import DocumentSelector from '../components/Documents/DocumentSelector'
import PDFViewer from '../components/Documents/PDFViewer'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import ErrorMessage from '../components/Common/ErrorMessage'

const Documents = () => {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [documents, setDocuments] = useState([])

  const { data, loading, error, refetch } = useApi(() => documentAPI.getAll())

  useEffect(() => {
    if (data) {
      setDocuments(data)
      // Auto-select the first document if none is selected
      if (!selectedDocument && data.length > 0) {
        setSelectedDocument(data[0])
      }
    }
  }, [data])

  const handleUploadSuccess = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev])
    setSelectedDocument(newDocument)
    refetch()
  }

  const handleSelectDocument = (document) => {
    setSelectedDocument(document)
  }

  if (loading) {
    return <LoadingSpinner message="Loading your documents..." />
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage 
          message={error || 'Failed to load documents'} 
          onRetry={refetch} 
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="700">
        Document Management
      </Typography>

      {documents.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Get started by uploading your first PDF document. We support NCERT Physics textbooks and other educational materials.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Sidebar - Upload and Document List */}
        <Grid item xs={12} md={4}>
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          <Box sx={{ mt: 3 }}>
            <DocumentSelector
              documents={documents}
              selectedDocument={selectedDocument}
              onSelectDocument={handleSelectDocument}
            />
          </Box>
        </Grid>
        
        {/* Right Main Area - PDF Viewer */}
        <Grid item xs={12} md={8}>
          <Box sx={{ height: '80vh' }}>
            <PDFViewer document={selectedDocument} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Documents