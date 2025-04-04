import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Table,
  Nav,
  Tabs,
  Tab,
  Modal,
  InputGroup,
  Badge
} from 'react-bootstrap';
import SingleBranchPDFGenerator from './SingleBranchPDFGenerator';

const EditableTableView = ({ attendanceData, setAttendanceData, stats, examDetails, setExamDetails }) => {
  // State for editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filteredView, setFilteredView] = useState('all'); // 'all', 'absent', 'malpractice'
  const [activeTab, setActiveTab] = useState(null);
  
  // Branch mapping for tab organization
  const branchCodes = {
    "01": "Civil Engineering",
    "02": "Electrical & Electronics Engineering",
    "03": "Mechanical Engineering",
    "04": "Electronics & Communication",
    "05": "Computer Science",
    "12": "Information Technology",
    "42": "Artificial Intelligence",
    "66": "Data Science"
  };
  
  // Extract branch code from hall ticket
  const extractBranchCode = (hallTicket) => {
    if (hallTicket && hallTicket.length >= 8) {
      return hallTicket.slice(6, 8);
    }
    return "00";
  };
  
  // Organize students by branch
  const getStudentsByBranch = () => {
    const branchStudents = {};
    
    // Initialize empty arrays for each branch
    Object.keys(branchCodes).forEach(code => {
      branchStudents[code] = [];
    });
    
    // Add an "Other" category for unrecognized branch codes
    branchStudents["00"] = [];
    
    // Process all rooms and organize students by branch
    Object.entries(attendanceData).forEach(([room, students]) => {
      Object.entries(students).forEach(([hallTicket, status]) => {
        const branchCode = extractBranchCode(hallTicket);
        
        // Push student data with additional information
        if (branchStudents[branchCode] || branchStudents["00"]) {
          const studentData = {
            hallTicket,
            status,
            room,
            // Extract reg year from first two digits
            regYear: hallTicket.slice(0, 2),
            // Extract college code from next four digits
            collegeCode: hallTicket.slice(2, 6),
            // Extract branch code
            branchCode: hallTicket.slice(6, 8),
            // Extract student number
            studentNumber: hallTicket.slice(8, 10)
          };
          
          if (branchStudents[branchCode]) {
            branchStudents[branchCode].push(studentData);
          } else {
            branchStudents["00"].push(studentData);
          }
        }
      });
    });
    
    // Sort students within each branch by hall ticket
    Object.keys(branchStudents).forEach(branch => {
      branchStudents[branch].sort((a, b) => a.hallTicket.localeCompare(b.hallTicket));
    });
    
    return branchStudents;
  };
  
  // Organized students by branch
  const [branchStudents, setBranchStudents] = useState(getStudentsByBranch());
  
  // Update branch students when attendance data changes
  useEffect(() => {
    setBranchStudents(getStudentsByBranch());
    
    // Set active tab if not already set
    const branches = Object.keys(getStudentsByBranch())
      .filter(code => getStudentsByBranch()[code].length > 0);
      
    if (branches.length > 0 && !activeTab) {
      // Default to Computer Science (05) if available, otherwise first branch
      const defaultBranch = branches.includes("05") ? "05" : branches[0];
      setActiveTab(defaultBranch);
      
      // Update exam details with selected branch if not already set
      if (!examDetails.branch) {
        setExamDetails(prev => ({...prev, branch: defaultBranch}));
      }
    }
  }, [attendanceData]);
  
  // Update active tab when branch selection changes in exam details
  useEffect(() => {
    if (examDetails.branch && Object.keys(branchStudents).includes(examDetails.branch) && 
        branchStudents[examDetails.branch].length > 0) {
      setActiveTab(examDetails.branch);
    }
  }, [examDetails.branch]);
  
  // Handle status change
  const handleStatusChange = (hallTicket, room, newStatus) => {
    const updatedAttendanceData = { ...attendanceData };
    updatedAttendanceData[room][hallTicket] = newStatus;
    setAttendanceData(updatedAttendanceData);
  };
  
  // Handle edit button click
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };
  
  // Handle save changes from modal
  const handleSaveChanges = (updatedStudent) => {
    // Create a deep copy of the attendance data to avoid direct state mutation
    const updatedAttendanceData = JSON.parse(JSON.stringify(attendanceData));
    
    // If hall ticket changed, we need to delete the old entry and add a new one
    if (updatedStudent.hallTicket !== editingStudent.hallTicket) {
      // Delete old entry
      delete updatedAttendanceData[editingStudent.room][editingStudent.hallTicket];
      
      // Add new entry
      if (!updatedAttendanceData[updatedStudent.room]) {
        updatedAttendanceData[updatedStudent.room] = {};
      }
      updatedAttendanceData[updatedStudent.room][updatedStudent.hallTicket] = updatedStudent.status;
    } 
    // If only room or status changed
    else if (updatedStudent.room !== editingStudent.room || updatedStudent.status !== editingStudent.status) {
      // Remove from old room if room changed
      if (updatedStudent.room !== editingStudent.room) {
        delete updatedAttendanceData[editingStudent.room][editingStudent.hallTicket];
        
        // Ensure new room exists
        if (!updatedAttendanceData[updatedStudent.room]) {
          updatedAttendanceData[updatedStudent.room] = {};
        }
      }
      
      // Update with new status in appropriate room
      updatedAttendanceData[updatedStudent.room][updatedStudent.hallTicket] = updatedStudent.status;
    }
    
    // Update state
    setAttendanceData(updatedAttendanceData);
    setShowModal(false);
    setEditingStudent(null);
  };
  
  // Calculate statistics for each branch
  const getBranchStats = (branchCode) => {
    const students = branchStudents[branchCode] || [];
    const total = students.length;
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const malpractice = students.filter(s => s.status === 'malpractice').length;
    
    return { total, present, absent, malpractice };
  };
  
  // Filter students based on selected view
  const getFilteredStudents = (students) => {
    if (filteredView === 'all') return students;
    return students.filter(s => s.status === filteredView);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // Student edit modal
  const StudentEditModal = () => {
    const [student, setStudent] = useState(editingStudent || {});
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setStudent({
        ...student,
        [name]: value
      });
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      handleSaveChanges(student);
    };
    
    return (
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Hall Ticket Number</Form.Label>
              <Form.Control 
                type="text" 
                name="hallTicket" 
                value={student.hallTicket || ''} 
                onChange={handleChange}
                pattern="[A-Za-z0-9]{10}"
                maxLength="10"
                required
              />
              <Form.Text className="text-muted">
                10 characters alphanumeric
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Room</Form.Label>
              <Form.Control 
                type="text" 
                name="room" 
                value={student.room || ''} 
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select 
                name="status" 
                value={student.status || 'present'} 
                onChange={handleChange}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="malpractice">Malpractice</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  };
  
  return (
    <Container fluid className="editable-table-view py-4">
      {/* Header with JNTUA and SVIT details */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="text-center">
          <h6 className="text-muted mb-2">Jawaharlal Nehru Technological University, Anantapur – 515 002</h6>
          <h5 className="fw-bold mb-2">SRI VENKATESWARA INSTITUTE OF TECHNOLOGY</h5>
          <h6 className="fw-bold mb-2">HAMPAPURAM - ANANTAPUR</h6>
          <h5 className="fw-bold mt-3">9F D - FORM</h5>
          
          {isEditing ? (
            <Row className="mt-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name of the Examination</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={examDetails.examName} 
                    onChange={(e) => setExamDetails({...examDetails, examName: e.target.value})}
                    placeholder="Enter examination name"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Regulation</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={examDetails.regulation} 
                    onChange={(e) => setExamDetails({...examDetails, regulation: e.target.value})}
                    placeholder="E.g., R20"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Exam Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={examDetails.examDate} 
                    onChange={(e) => setExamDetails({...examDetails, examDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={examDetails.subjectName} 
                    onChange={(e) => setExamDetails({...examDetails, subjectName: e.target.value})}
                    placeholder="Enter subject name"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject Code</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={examDetails.subjectCode} 
                    onChange={(e) => setExamDetails({...examDetails, subjectCode: e.target.value})}
                    placeholder="Enter subject code"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    value={examDetails.branch} 
                    onChange={(e) => setExamDetails({...examDetails, branch: e.target.value})}
                  >
                    <option value="">All Branches</option>
                    {Object.entries(branchCodes).map(([code, name]) => (
                      <option key={code} value={code}>{name} ({code})</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          ) : (
            <>
              <div className="mt-3">
                <p className="fw-bold mb-1">
                  <span className="text-muted">Name of the Examination: </span>
                  {examDetails.examName || 'B.Tech Regular Examinations'}
                  {examDetails.regulation ? ` (${examDetails.regulation})` : ''}
                </p>
                <p className="fw-bold mb-1">
                  <span className="text-muted">Date: </span>
                  {examDetails.examDate ? new Date(examDetails.examDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                </p>
                <p className="fw-bold">
                  <span className="text-muted">Subject & Code: </span>
                  {examDetails.subjectName ? examDetails.subjectName : '______'} 
                  {examDetails.subjectCode ? `(${examDetails.subjectCode})` : ''}
                </p>
              </div>
            </>
          )}
          
          <div className="d-flex justify-content-end">
            <Button 
              variant={isEditing ? "success" : "outline-primary"} 
              size="sm" 
              onClick={toggleEditMode}
            >
              {isEditing ? "Save Details" : "Edit Details"}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Attendance Filters */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Attendance Data</h5>
            <div>
              <Button
                variant={filteredView === 'all' ? 'primary' : 'outline-primary'}
                size="sm"
                className="me-2"
                onClick={() => setFilteredView('all')}
              >
                All Students
              </Button>
              <Button
                variant={filteredView === 'absent' ? 'danger' : 'outline-danger'}
                size="sm"
                className="me-2"
                onClick={() => setFilteredView('absent')}
              >
                Absent Only
              </Button>
              <Button
                variant={filteredView === 'malpractice' ? 'warning' : 'outline-warning'}
                size="sm"
                onClick={() => setFilteredView('malpractice')}
              >
                Malpractice Only
              </Button>
            </div>
          </div>

          {/* Show attendance statistics */}
          <Row className="mb-3">
            <Col md={3}>
              <Card className="text-center stats-card bg-light mb-3 mb-md-0">
                <Card.Body>
                  <h3>{stats.totalStudents}</h3>
                  <p className="mb-0">Total Students</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center stats-card bg-success text-white mb-3 mb-md-0">
                <Card.Body>
                  <h3>{stats.present}</h3>
                  <p className="mb-0">Present</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center stats-card bg-danger text-white mb-3 mb-md-0">
                <Card.Body>
                  <h3>{stats.absent}</h3>
                  <p className="mb-0">Absent</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center stats-card bg-warning mb-3 mb-md-0">
                <Card.Body>
                  <h3>{stats.malpractice}</h3>
                  <p className="mb-0">Malpractice</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Branch-based Tabs */}
          <Tabs 
            activeKey={activeTab || Object.keys(branchStudents).find(key => branchStudents[key].length > 0)} 
            onSelect={(key) => {
              setActiveTab(key);
              setExamDetails({...examDetails, branch: key});
            }}
            id="branch-tabs" 
            className="mb-3"
          >
            {Object.entries(branchCodes).map(([code, name]) => {
              // Skip branches with no students
              if ((branchStudents[code] || []).length === 0) return null;
              
              const branchStats = getBranchStats(code);
              const filteredBranchStudents = getFilteredStudents(branchStudents[code] || []);
              
              return (
                <Tab 
                  key={code} 
                  eventKey={code} 
                  title={
                    <div>
                      {name} <span className="badge bg-secondary">{branchStats.total}</span>
                    </div>
                  }
                >
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{name} ({code})</h5>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-success me-2">Present: {branchStats.present}</span>
                          <span className="badge bg-danger me-2">Absent: {branchStats.absent}</span>
                          <span className="badge bg-warning me-3">Malpractice: {branchStats.malpractice}</span>
                          
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              // Set branch in exam details
                              setExamDetails({...examDetails, branch: code});
                            }}
                            className="me-2"
                          >
                            <i className="fas fa-edit me-1"></i> Set as Current
                          </Button>
                          
                          <SingleBranchPDFGenerator
                            attendanceData={attendanceData}
                            examDetails={{...examDetails, branch: code}}
                            branchCode={code}
                          />
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {filteredBranchStudents.length > 0 ? (
                        <>
                          <Table responsive striped bordered hover className="mb-3">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Hall Ticket</th>
                                <th>Room</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBranchStudents.map((student, index) => (
                                <tr 
                                  key={student.hallTicket}
                                  className={
                                    student.status === 'absent' ? 'table-danger fw-bold' : 
                                    student.status === 'malpractice' ? 'table-warning fw-bold' : ''
                                  }
                                >
                                  <td>{index + 1}</td>
                                  <td>
                                    <code className="hall-ticket">{student.hallTicket}</code>
                                  </td>
                                  <td>{student.room}</td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <Button
                                        size="sm"
                                        variant={student.status === 'present' ? 'success' : 'outline-success'}
                                        onClick={() => handleStatusChange(student.hallTicket, student.room, 'present')}
                                      >
                                        Present
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={student.status === 'absent' ? 'danger' : 'outline-danger'}
                                        onClick={() => handleStatusChange(student.hallTicket, student.room, 'absent')}
                                      >
                                        Absent
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={student.status === 'malpractice' ? 'warning' : 'outline-warning'}
                                        onClick={() => handleStatusChange(student.hallTicket, student.room, 'malpractice')}
                                      >
                                        Malpractice
                                      </Button>
                                    </div>
                                  </td>
                                  <td>
                                    <Button 
                                      size="sm" 
                                      variant="outline-primary"
                                      onClick={() => handleEditClick(student)}
                                    >
                                      Edit
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          
                          {/* Branch Summary Section */}
                          <div className="bg-light p-3 rounded border">
                            <h6 className="mb-3">Branch Attendance Summary</h6>
                            <div className="row">
                              <div className="col-md-3">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="me-2" style={{width: "20px", height: "20px", backgroundColor: "#f8f9fa", border: "1px solid #dee2e6"}}></div>
                                  <div><strong>Total Students:</strong> {branchStats.total}</div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="me-2" style={{width: "20px", height: "20px", backgroundColor: "#d1e7dd", border: "1px solid #badbcc"}}></div>
                                  <div><strong>Present:</strong> {branchStats.present} ({Math.round(branchStats.present/branchStats.total * 100) || 0}%)</div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="me-2" style={{width: "20px", height: "20px", backgroundColor: "#f8d7da", border: "1px solid #f5c2c7"}}></div>
                                  <div><strong>Absent:</strong> {branchStats.absent} ({Math.round(branchStats.absent/branchStats.total * 100) || 0}%)</div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="me-2" style={{width: "20px", height: "20px", backgroundColor: "#fff3cd", border: "1px solid #ffecb5"}}></div>
                                  <div><strong>Malpractice:</strong> {branchStats.malpractice} ({Math.round(branchStats.malpractice/branchStats.total * 100) || 0}%)</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Alert variant="info">
                          No {filteredView !== 'all' ? filteredView : ''} students found in this branch.
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
              );
            })}
            
            {/* Add an "Other" tab for unrecognized branch codes */}
            {(branchStudents["00"] || []).length > 0 && (
              <Tab 
                eventKey="00" 
                title={
                  <div>
                    Other <span className="badge bg-secondary">{branchStudents["00"].length}</span>
                  </div>
                }
              >
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Unrecognized Branch Codes</h5>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success me-2">Present: {getBranchStats("00").present}</span>
                        <span className="badge bg-danger me-2">Absent: {getBranchStats("00").absent}</span>
                        <span className="badge bg-warning me-3">Malpractice: {getBranchStats("00").malpractice}</span>
                        
                        <SingleBranchPDFGenerator
                          attendanceData={attendanceData}
                          examDetails={{...examDetails, branch: "00"}}
                          branchCode="00"
                        />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {getFilteredStudents(branchStudents["00"] || []).length > 0 ? (
                      <Table responsive striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Hall Ticket</th>
                            <th>Room</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredStudents(branchStudents["00"] || []).map((student, index) => (
                            <tr 
                              key={student.hallTicket}
                              className={
                                student.status === 'absent' ? 'table-danger fw-bold' : 
                                student.status === 'malpractice' ? 'table-warning fw-bold' : ''
                              }
                            >
                              <td>{index + 1}</td>
                              <td>
                                <code className="hall-ticket">{student.hallTicket}</code>
                              </td>
                              <td>{student.room}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={student.status === 'present' ? 'success' : 'outline-success'}
                                    onClick={() => handleStatusChange(student.hallTicket, student.room, 'present')}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={student.status === 'absent' ? 'danger' : 'outline-danger'}
                                    onClick={() => handleStatusChange(student.hallTicket, student.room, 'absent')}
                                  >
                                    Absent
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={student.status === 'malpractice' ? 'warning' : 'outline-warning'}
                                    onClick={() => handleStatusChange(student.hallTicket, student.room, 'malpractice')}
                                  >
                                    Malpractice
                                  </Button>
                                </div>
                              </td>
                              <td>
                                <Button 
                                  size="sm" 
                                  variant="outline-primary"
                                  onClick={() => handleEditClick(student)}
                                >
                                  Edit
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info">
                        No {filteredView !== 'all' ? filteredView : ''} students found with unrecognized branch codes.
                      </Alert>
                    )}
                    
                    {/* Summary for Other branch codes */}
                    {getFilteredStudents(branchStudents["00"] || []).length > 0 && (
                      <div className="bg-light p-3 rounded border mt-3">
                        <h6 className="mb-3">Unrecognized Branch Codes Summary</h6>
                        <div className="row">
                          <div className="col-md-3">
                            <div className="d-flex align-items-center mb-2">
                              <div className="me-2" style={{width: "20px", height: "20px", backgroundColor: "#f8f9fa", border: "1px solid #dee2e6"}}></div>
                              <div><strong>Total Students:</strong> {getBranchStats("00").total}</div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="d-flex align-items-center mb-2">
                              <div className="me-2" style={{width: "20px", height: "20px", backgroundColor: "#d1e7dd", border: "1px solid #badbcc"}}></div>
                              <div><strong>Present:</strong> {getBranchStats("00").present} ({Math.round(getBranchStats("00").present/getBranchStats("00").total * 100) || 0}%)</div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="d-flex align-items-center mb-2">
                              <div className="me-2" style={{width: "20px", height: "20px", backgroundColor: "#f8d7da", border: "1px solid #f5c2c7"}}></div>
                              <div><strong>Absent:</strong> {getBranchStats("00").absent} ({Math.round(getBranchStats("00").absent/getBranchStats("00").total * 100) || 0}%)</div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="d-flex align-items-center mb-2">
                              <div className="me-2" style={{width: "20px", height: "20px", backgroundColor: "#fff3cd", border: "1px solid #ffecb5"}}></div>
                              <div><strong>Malpractice:</strong> {getBranchStats("00").malpractice} ({Math.round(getBranchStats("00").malpractice/getBranchStats("00").total * 100) || 0}%)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            )}
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Student Edit Modal */}
      {editingStudent && <StudentEditModal />}
    </Container>
  );
};

export default EditableTableView;