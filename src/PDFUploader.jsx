import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFUploader = ({ onExtractedHallTickets }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [extractedHallTickets, setExtractedHallTickets] = useState([]);

  // Handle file upload
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please upload a valid PDF file.');
    }
  };

  // Process PDF to extract hall ticket numbers
  const processFile = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setExtractedHallTickets([]);

    try {
      // Read the PDF file
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target.result);
          
          // Load the PDF document
          const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
          const numPages = pdf.numPages;
          
          // Initialize hall tickets array
          const hallTickets = new Set();
          
          // Process each page
          for (let i = 1; i <= numPages; i++) {
            // Update progress
            setProgress(Math.floor((i / numPages) * 100));
            
            // Get the page
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items;
            
            // Extract text from the page
            const pageText = textItems.map(item => item.str).join(' ');
            
            // Extract hall ticket numbers (10-character alphanumeric strings)
            // Using regex to find patterns that look like hall ticket numbers
            const hallTicketRegex = /\b[A-Z0-9]{10}\b/g;
            const matches = pageText.match(hallTicketRegex) || [];
            
            // Add to our set (to avoid duplicates)
            matches.forEach(match => hallTickets.add(match));
          }
          
          // Convert set to array and update state
          const hallTicketArray = Array.from(hallTickets);
          setExtractedHallTickets(hallTicketArray);
          
          // Call the parent component's callback with the hall tickets
          if (hallTicketArray.length > 0) {
            onExtractedHallTickets(hallTicketArray);
          } else {
            setError('No hall ticket numbers found in the PDF. Hall tickets should be 10-character alphanumeric strings.');
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error processing PDF:', err);
          setError(`Error processing PDF: ${err.message}`);
          setLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        setError('Error reading the file. Please try again.');
        setLoading(false);
      };
      
      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error in PDF processing:', err);
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <h5 className="mb-3">Extract Hall Tickets from PDF</h5>
        
        <Form.Group controlId="pdfFile" className="mb-3">
          <Form.Label>Upload PDF File</Form.Label>
          <Form.Control 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            disabled={loading}
          />
          <Form.Text className="text-muted">
            Upload a PDF file containing hall ticket numbers. The system will scan for 10-character alphanumeric strings.
          </Form.Text>
        </Form.Group>
        
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Processing PDF... {progress}%</span>
            </div>
            <div className="progress">
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                style={{ width: `${progress}%` }} 
                aria-valuenow={progress} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        ) : (
          <Button 
            variant="primary" 
            onClick={processFile} 
            disabled={!file || loading}
            className="mb-3"
          >
            Extract Hall Tickets
          </Button>
        )}
        
        {extractedHallTickets.length > 0 && (
          <div>
            <h6>Extracted Hall Tickets <Badge bg="success">{extractedHallTickets.length}</Badge></h6>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <ListGroup>
                {extractedHallTickets.map((ticket, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <code>{ticket}</code>
                    <small className="text-muted">Branch Code: {ticket.slice(6, 8)}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PDFUploader;