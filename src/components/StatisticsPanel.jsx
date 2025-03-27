import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCheck, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const StatisticsPanel = ({ stats }) => {
  return (
    <div className="mb-4">
      <Row>
        <Col md={3} className="mb-3">
          <Card className="h-100 bg-light">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{stats.totalStudentsInRoom}</h4>
                <p className="text-muted mb-0">Total Students</p>
              </div>
              <FontAwesomeIcon icon={faUsers} size="2x" className="text-secondary" />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="h-100 bg-success text-white">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{stats.present}</h4>
                <p className="mb-0">
                  Present
                  {stats.totalStudentsInRoom > 0 && (
                    <small className="ms-1">({stats.presentPercentage}%)</small>
                  )}
                </p>
              </div>
              <FontAwesomeIcon icon={faCheck} size="2x" />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="h-100 bg-danger text-white">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{stats.absent}</h4>
                <p className="mb-0">
                  Absent
                  {stats.totalStudentsInRoom > 0 && (
                    <small className="ms-1">({stats.absentPercentage}%)</small>
                  )}
                </p>
              </div>
              <FontAwesomeIcon icon={faTimes} size="2x" />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="h-100 bg-warning">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{stats.malpractice}</h4>
                <p className="mb-0">
                  Malpractice
                  {stats.totalStudentsInRoom > 0 && (
                    <small className="ms-1">({stats.malpracticePercentage}%)</small>
                  )}
                </p>
              </div>
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPanel;