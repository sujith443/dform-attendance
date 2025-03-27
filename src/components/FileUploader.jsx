import React from 'react';
import { Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

const FileUploader = ({ onFileUpload, loading, error }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    } else if (file) {
      alert('Please upload a PDF file');
    }
  };

  return (
    <div className="py-4 text-center">
      <div className="mb-4">
        <FontAwesomeIcon icon={faFilePdf} size="4x" className="text-primary mb-3" />
        <h2>Upload Seating Plan PDF</h2>
        <p className="text-muted">Upload the SVIT Seating Plan PDF to track student attendance</p>
      </div>
      
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Select PDF File</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Only PDF files containing SVIT seating plans are supported
            </Form.Text>
          </Form.Group>
          
          {loading && (
            <div className="text-center mt-4">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Processing PDF file...</span>
              </Spinner>
              <p className="mt-2 text-muted">Processing PDF file...</p>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default FileUploader;