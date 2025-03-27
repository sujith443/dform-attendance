import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Document, Page, pdfjs } from 'react-pdf';

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFUploader = ({ onExtractedHallTickets }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [hallTickets, setHallTickets] = useState([]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else {
      setPdfFile(null);
      setError('Please upload a valid PDF file.');
    }
  };

  const extractTextFromPDF = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pdf = await pdfjs.getDocument(URL.createObjectURL(pdfFile)).promise;
      let fullText = '';

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => item.str).join(' ');
        fullText += textItems + ' ';
      }

      setExtractedText(fullText);

      // Extract hall ticket numbers (10 character alphanumeric)
      const hallTicketRegex = /[A-Za-z0-9]{10}/g;
      const matches = fullText.match(hallTicketRegex) || [];

      // Filter for hall ticket pattern (usually starting with digits followed by alphanumeric)
      const filteredMatches = matches.filter(match => /^\d{3}[A-Za-z0-9]{7}$/.test(match));
      
      setHallTickets(filteredMatches);
      
      if (filteredMatches.length > 0) {
        // Pass hall tickets to parent component
        if (onExtractedHallTickets) {
          onExtractedHallTickets(filteredMatches);
        }
      } else {
        setError('No hall ticket numbers found in the PDF.');
      }
    } catch (err) {
      console.error('Error extracting text from PDF:', err);
      setError('Failed to extract text from the PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body>
        <h5 className="card-title mb-3">Extract Hall Tickets from PDF</h5>
        
        <Form.Group className="mb-3">
          <Form.Label>Upload PDF File</Form.Label>
          <Form.Control 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            className="mb-3"
          />
          <Form.Text className="text-muted">
            Upload a PDF file containing hall ticket numbers to extract.
          </Form.Text>
        </Form.Group>
        
        <Button 
          variant="primary" 
          onClick={extractTextFromPDF} 
          disabled={!pdfFile || loading}
          className="mb-3"
        >
          {loading ? 'Extracting...' : 'Extract Hall Tickets'}
        </Button>
        
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        
        {hallTickets.length > 0 && (
          <div className="mt-4">
            <Alert variant="success">
              Successfully extracted {hallTickets.length} hall ticket numbers.
            </Alert>
            
            <h6 className="mt-3">Extracted Hall Tickets:</h6>
            <div className="hall-tickets-container border p-3 rounded bg-light">
              {hallTickets.map((ticket, index) => (
                <Badge 
                  key={index} 
                  bg="primary" 
                  className="m-1 p-2"
                >
                  {ticket}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {pdfFile && (
          <div className="pdf-preview mt-4">
            <h6>PDF Preview:</h6>
            <div className="pdf-document-container border rounded">
              <Document
                file={URL.createObjectURL(pdfFile)}
                onLoadSuccess={onDocumentLoadSuccess}
                className="pdf-document"
              >
                <Page 
                  pageNumber={pageNumber} 
                  width={300}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              
              <div className="text-center mt-2">
                <p>
                  Page {pageNumber} of {numPages}
                </p>
                <div className="d-flex justify-content-center">
                  <Button 
                    size="sm" 
                    onClick={() => setPageNumber(pageNumber - 1)}
                    disabled={pageNumber <= 1}
                    className="me-2"
                  >
                    Previous
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={pageNumber >= numPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PDFUploader;