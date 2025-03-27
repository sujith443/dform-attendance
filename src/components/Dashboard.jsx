import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Alert, ProgressBar, ButtonGroup, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSync, faFileDownload, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import RoomSelector from './RoomSelector';
import StatisticsPanel from './StatisticsPanel';
import StudentTable from './StudentTable';
import PDFGenerator from '../utils/PDFGenerator';
import ExamInfoPanel from './ExamInfoPanel';

const Dashboard = ({ studentData, onReset }) => {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Set initial data when studentData changes
  useEffect(() => {
    if (studentData) {
      setStudents(studentData.students);
      if (studentData.rooms.length > 0) {
        setSelectedRoom(studentData.rooms[0]);
        filterStudents(studentData.rooms[0], '');
      }
    }
  }, [studentData]);

  // Filter students based on room and search term
  const filterStudents = (room, term) => {
    if (!students.length) return;
    
    setFilteredStudents(students.filter(student => 
      student.room === room &&
      (term === '' || student.hallTicket.toLowerCase().includes(term.toLowerCase()))
    ));
  };

  // Handle room selection change
  const handleRoomChange = (room) => {
    setSelectedRoom(room);
    filterStudents(room, searchTerm);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterStudents(selectedRoom, term);
  };

  // Update student status
  const updateStudentStatus = (hallTicket, newStatus) => {
    const updatedStudents = students.map(student => 
      student.hallTicket === hallTicket 
        ? { ...student, status: newStatus } 
        : student
    );
    
    setStudents(updatedStudents);
    filterStudents(selectedRoom, searchTerm);
  };

  // Bulk update all students in a room
  const bulkUpdateRoomStatus = (status) => {
    const updatedStudents = students.map(student => 
      student.room === selectedRoom 
        ? { ...student, status } 
        : student
    );
    
    setStudents(updatedStudents);
    filterStudents(selectedRoom, searchTerm);
  };

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const roomStudents = students.filter(s => s.room === selectedRoom);
    const totalStudentsInRoom = roomStudents.length;
    const present = roomStudents.filter(s => s.status === 'Present').length;
    const absent = roomStudents.filter(s => s.status === 'Absent').length;
    const malpractice = roomStudents.filter(s => s.status === 'Malpractice').length;
    const notMarked = totalStudentsInRoom - present - absent - malpractice;
    
    // Calculate percentages
    const presentPercentage = totalStudentsInRoom > 0 
      ? ((present / totalStudentsInRoom) * 100).toFixed(1) 
      : 0;
    
    const absentPercentage = totalStudentsInRoom > 0 
      ? ((absent / totalStudentsInRoom) * 100).toFixed(1) 
      : 0;
      
    const malpracticePercentage = totalStudentsInRoom > 0 
      ? ((malpractice / totalStudentsInRoom) * 100).toFixed(1) 
      : 0;
    
    return { 
      totalStudentsInRoom, 
      present, 
      absent, 
      malpractice, 
      notMarked,
      presentPercentage,
      absentPercentage,
      malpracticePercentage
    };
  };

  // Calculate room configuration
  const getRoomConfig = () => {
    if (!studentData || !studentData.roomDetails || !selectedRoom) {
      return { rows: 0, columns: 0 };
    }
    
    return studentData.roomDetails[selectedRoom]?.configuration || { rows: 0, columns: 0 };
  };

  // Generate and download PDF report
  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      // Pass complete data to PDF generator
      await PDFGenerator.generateAttendanceReport({
        examInfo: studentData.examInfo,
        rooms: studentData.rooms,
        roomDetails: studentData.roomDetails,
        students,
        summary: studentData.summary
      });
      setGeneratingPDF(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
      setGeneratingPDF(false);
    }
  };

  // Get attendance statistics
  const stats = getAttendanceStats();
  const roomConfig = getRoomConfig();

  // Check if all students have been marked
  const allMarked = stats.notMarked === 0;

  // Overall progress calculation
  const totalStudents = students.length;
  const totalMarked = students.filter(s => s.status !== 'Not Marked').length;
  const overallProgress = totalStudents > 0 
    ? Math.round((totalMarked / totalStudents) * 100) 
    : 0;

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
        <Button 
          variant="outline-primary"
          onClick={onReset}
          className="mb-3 mb-md-0"
        >
          <FontAwesomeIcon icon={faSync} className="me-2" />
          Upload New File
        </Button>
        
        <div className="text-md-end">
          <div className="text-muted small mb-1">Overall Progress: {overallProgress}%</div>
          <ProgressBar now={overallProgress} style={{ height: '0.5rem' }} />
        </div>
      </div>
      
      {/* Exam Information Panel */}
      <ExamInfoPanel examInfo={studentData?.examInfo} />
      
      <Row className="mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <RoomSelector 
            rooms={studentData?.rooms || []}
            selectedRoom={selectedRoom}
            onRoomChange={handleRoomChange}
            roomDetails={studentData?.roomDetails}
          />
        </Col>
        
        <Col md={6}>
          <Form.Group>
            <Form.Label>Search Hall Ticket</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Enter hall ticket number"
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      
      {/* Room Configuration Info */}
      {roomConfig.rows > 0 && (
        <div className="mb-3 text-muted small">
          Room Configuration: {roomConfig.rows} Rows × {roomConfig.columns} Columns
        </div>
      )}
      
      <StatisticsPanel stats={stats} />
      
      {/* Bulk Action Buttons */}
      <div className="mb-4">
        <ButtonGroup>
          <Button
            variant="success"
            size="sm"
            onClick={() => bulkUpdateRoomStatus('Present')}
          >
            Mark All Present
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => bulkUpdateRoomStatus('Absent')}
          >
            Mark All Absent
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => bulkUpdateRoomStatus('Not Marked')}
          >
            Reset All
          </Button>
        </ButtonGroup>
      </div>
      
      {/* Toggle view mode */}
      <div className="d-flex justify-content-end mb-3">
        <ButtonGroup>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('grid')}
          >
            Seating View
          </Button>
        </ButtonGroup>
      </div>
      
      <StudentTable 
        students={filteredStudents} 
        updateStudentStatus={updateStudentStatus}
        viewMode={viewMode}
      />
      
      <div className="d-flex justify-content-end mt-4">
        <Button 
          variant="success"
          disabled={!allMarked || generatingPDF}
          onClick={handleGeneratePDF}
        >
          {generatingPDF ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Generating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFileDownload} className="me-2" />
              Generate Attendance PDF
            </>
          )}
        </Button>
      </div>
      
      {!allMarked && (
        <Alert variant="warning" className="mt-3">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <span className="fw-bold">Incomplete Attendance:</span> {stats.notMarked} students have not been marked yet. Please mark all students before generating the PDF.
        </Alert>
      )}
    </>
  );
};

export default Dashboard;