import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  Paper,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Toolbar,
  Alert,
} from '@mui/material'
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFViewer = ({ document }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [error, setError] = useState(null)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setPageNumber(1)
    setError(null)
  }

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error)
    setError('Failed to load PDF document')
  }

  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  if (!document) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Select a document to view
        </Typography>
      </Paper>
    )
  }

  if (!document.processed) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="warning">
          Document is still processing. Please wait a moment and try again.
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', minHeight: '64px !important' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
          {document.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <IconButton onClick={zoomOut} disabled={scale <= 0.5} size="small">
            <ZoomOutIcon />
          </IconButton>
          
          <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          
          <IconButton onClick={zoomIn} disabled={scale >= 3.0} size="small">
            <ZoomInIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <IconButton onClick={goToPreviousPage} disabled={pageNumber <= 1} size="small">
              <PrevIcon />
            </IconButton>
            
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                displayEmpty
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2" sx={{ mx: 1 }}>
              of {numPages || '--'}
            </Typography>
            
            <IconButton onClick={goToNextPage} disabled={pageNumber >= numPages} size="small">
              <NextIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* PDF Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, display: 'flex', justifyContent: 'center' }}>
        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <Document
            file={document.file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading PDF...</Typography>
              </Box>
            }
            error={
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error">
                  Failed to load PDF. Please try again.
                </Typography>
              </Box>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </Box>
    </Paper>
  )
}

export default PDFViewer