import React from 'react';
import { Table, Badge, Form, Card, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const StudentTable = ({ students, updateStudentStatus, viewMode = 'list' }) => {
  // Generate status badge with appropriate color
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Present':
        return (
          <Badge bg="success">
            <FontAwesomeIcon icon={faCheck} className="me-1" />
            Present
          </Badge>
        );
      case 'Absent':
        return (
          <Badge bg="danger">
            <FontAwesomeIcon icon={faTimes} className="me-1" />
            Absent
          </Badge>
        );
      case 'Malpractice':
        return (
          <Badge bg="warning" text="dark">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
            Malpractice
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary">
            Not Marked
          </Badge>
        );
    }
  };

  // Get status variant for card styling
  const getStatusVariant = (status) => {
    switch(status) {
      case 'Present': return 'success';
      case 'Absent': return 'danger';
      case 'Malpractice': return 'warning';
      default: return 'light';
    }
  };

  // Render a visual representation of the seating arrangement
  const renderSeatingGrid = () => {
    if (students.length === 0) return null;
    
    // Find max rows and columns to determine grid size
    const maxRow = Math.max(...students.map(s => s.row || 0));
    const maxCol = Math.max(...students.map(s => s.column || 0));
    
    // Create a 2D grid to place students
    const grid = Array(maxRow).fill().map(() => Array(maxCol).fill(null));
    
    // Place students in the grid
    students.forEach(student => {
      if (student.row && student.column) {
        const row = student.row - 1; // Convert to 0-based index
        const col = student.column - 1; // Convert to 0-based index
        
        if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
          grid[row][col] = student;
        }
      }
    });
    
    return (
      <div className="seating-grid my-4">
        <h5 className="mb-3">Seating Arrangement</h5>
        <Row>
          {grid.map((row, rowIndex) => 
            row.map((student, colIndex) => (
              <Col key={`${rowIndex}-${colIndex}`} xs={6} sm={4} md={3} lg={2} className="mb-3">
                <Card 
                  border={student ? getStatusVariant(student.status) : 'secondary'}
                  className={`h-100 ${!student ? 'opacity-50' : ''}`}
                >
                  <Card.Header className="py-1 px-2 text-center bg-light">
                    <small>DESK {rowIndex + 1} - COL {colIndex + 1}</small>
                  </Card.Header>
                  <Card.Body className="p-2">
                    {student ? (
                      <>
                        <div className="fw-bold small">{student.hallTicket}</div>
                        <div className="text-muted small mb-2">{student.branch}</div>
                        {student.status === 'Not Marked' ? (
                          <div className="d-flex flex-wrap gap-1">
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="py-0 px-1"
                              onClick={() => updateStudentStatus(student.hallTicket, 'Present')}
                            >
                              P
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="py-0 px-1"
                              onClick={() => updateStudentStatus(student.hallTicket, 'Absent')}
                            >
                              A
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              className="py-0 px-1"
                              onClick={() => updateStudentStatus(student.hallTicket, 'Malpractice')}
                            >
                              M
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            {getStatusBadge(student.status)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-muted small">Empty</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </div>
    );
  };

  // Render the list view
  const renderListView = () => {
    return (
      <div className="table-responsive">
        {students.length === 0 ? (
          <div className="text-center text-muted p-4">
            No students found for the selected criteria
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Hall Ticket</th>
                <th>Branch</th>
                <th>Seating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.hallTicket}>
                  <td>{index + 1}</td>
                  <td><strong>{student.hallTicket}</strong></td>
                  <td>{student.branch}</td>
                  <td>{student.seating}</td>
                  <td>{getStatusBadge(student.status)}</td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={student.status}
                      onChange={(e) => updateStudentStatus(student.hallTicket, e.target.value)}
                    >
                      <option value="Not Marked">Not Marked</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Malpractice">Malpractice</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    );
  };

  // Determine if grid view is possible
  const canShowGrid = students.some(s => s.row && s.column);

  if (viewMode === 'grid' && canShowGrid) {
    return renderSeatingGrid();
  } else {
    return renderListView();
  }
};

export default StudentTable;