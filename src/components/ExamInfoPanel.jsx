import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faBookOpen } from '@fortawesome/free-solid-svg-icons';

const ExamInfoPanel = ({ examInfo }) => {
  if (!examInfo) return null;
  
  return (
    <Card className="mb-4 bg-primary bg-opacity-10">
      <Card.Body>
        <h5 className="mb-3 text-primary">Examination Details</h5>
        
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBookOpen} className="text-primary me-3" size="lg" />
              <div>
                <div className="text-muted small">Exam</div>
                <div className="fw-bold">{examInfo.title}</div>
              </div>
            </div>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-primary me-3" size="lg" />
              <div>
                <div className="text-muted small">Date</div>
                <div className="fw-bold">{examInfo.date}</div>
              </div>
            </div>
          </Col>
          
          <Col md={4}>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-3" size="lg" />
              <div>
                <div className="text-muted small">Center</div>
                <div className="fw-bold">{examInfo.center}</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ExamInfoPanel;