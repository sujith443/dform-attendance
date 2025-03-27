import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Nav, Badge, Tabs, Tab } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import PDFUploader from './PDFUploader';
import BeautifulPDFGenerator from './BeautifulPDFGenerator';

function App() {
  const [file, setFile] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('excel');
  const [pdfExtractedHallTickets, setPdfExtractedHallTickets] = useState([]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setError(null);
    
    if (uploadedFile) {
      processExcelFile(uploadedFile);
    }
  };

  // Process Excel file
  const processExcelFile = (uploadedFile) => {
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Filter sheets that have "Seating" in their name
        const seatingSheets = workbook.SheetNames.filter(name => 
          name.includes('Seating')
        );
        
        if (seatingSheets.length === 0) {
          setError('No seating sheets found in the uploaded file.');
          setLoading(false);
          return;
        }
        
        // Extract hall ticket numbers from each seating sheet
        const roomsData = {};
        const allRooms = [];
        
        seatingSheets.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Extract room name from sheet name
          const roomName = sheetName.trim();
          allRooms.push(roomName);
          
          // Extract hall ticket numbers (assuming they're 10 characters with mix of letters and numbers)
          const hallTickets = [];
          
          sheetData.forEach(row => {
            if (!row) return;
            
            row.forEach(cell => {
              if (cell && typeof cell === 'string' || typeof cell === 'number') {
                const cellStr = cell.toString().trim();
                // Match 10 character alphanumeric strings that match hall ticket pattern
                if (/^[A-Za-z0-9]{10}$/.test(cellStr)) {
                  hallTickets.push(cellStr);
                }
              }
            });
          });
          
          // Initialize attendance status for each hall ticket (default: present)
          const hallTicketsWithStatus = hallTickets.reduce((acc, ticket) => {
            acc[ticket] = 'present';
            return acc;
          }, {});
          
          roomsData[roomName] = hallTicketsWithStatus;
        });
        
        setRooms(allRooms);
        setAttendanceData(roomsData);
        setSelectedRooms(allRooms);
        
        if (allRooms.length > 0) {
          setActiveRoom(allRooms[0]);
          updateStats(roomsData, allRooms);
          setSuccess(`Successfully loaded ${allRooms.length} seating rooms.`);
        }
        
      } catch (err) {
        console.error('Error processing file:', err);
        setError('Error processing the Excel file. Please make sure it is a valid Excel file.');
      }
      
      setLoading(false);
    };
    
    reader.onerror = () => {
      setError('Error reading the file. Please try again.');
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(uploadedFile);
  };

  // Handle room selection
  const handleRoomSelection = (room) => {
    setActiveRoom(room);
  };

  // Handle attendance status change
  const handleStatusChange = (hallTicket, newStatus) => {
    const updatedAttendanceData = { ...attendanceData };
    updatedAttendanceData[activeRoom][hallTicket] = newStatus;
    setAttendanceData(updatedAttendanceData);
    updateStats(updatedAttendanceData, selectedRooms);
  };

  // Toggle room selection for filtering
  const toggleRoomSelection = (room) => {
    const newSelectedRooms = selectedRooms.includes(room)
      ? selectedRooms.filter(r => r !== room)
      : [...selectedRooms, room];
    
    setSelectedRooms(newSelectedRooms);
    updateStats(attendanceData, newSelectedRooms);
    
    // If current active room is deselected, select the first available room
    if (!newSelectedRooms.includes(activeRoom) && newSelectedRooms.length > 0) {
      setActiveRoom(newSelectedRooms[0]);
    }
  };

  // Update statistics
  const updateStats = (data, selectedRooms) => {
    const newStats = {
      totalStudents: 0,
      present: 0,
      absent: 0,
      malpractice: 0
    };
    
    selectedRooms.forEach(room => {
      const roomData = data[room] || {};
      Object.values(roomData).forEach(status => {
        newStats.totalStudents++;
        if (status === 'present') newStats.present++;
        else if (status === 'absent') newStats.absent++;
        else if (status === 'malpractice') newStats.malpractice++;
      });
    });
    
    setStats(newStats);
  };

  // Handle extracted hall tickets from PDF
  const handleExtractedHallTickets = (hallTickets) => {
    setPdfExtractedHallTickets(hallTickets);
    
    // Create a new room for PDF extracted tickets
    const pdfRoomName = "PDF_Extracted_Room";
    
    // Initialize attendance status for each hall ticket (default: present)
    const hallTicketsWithStatus = hallTickets.reduce((acc, ticket) => {
      acc[ticket] = 'present';
      return acc;
    }, {});
    
    // Update attendanceData with new room
    const updatedAttendanceData = { ...attendanceData };
    updatedAttendanceData[pdfRoomName] = hallTicketsWithStatus;
    
    // Update rooms list
    const updatedRooms = [...rooms];
    if (!updatedRooms.includes(pdfRoomName)) {
      updatedRooms.push(pdfRoomName);
    }
    
    setAttendanceData(updatedAttendanceData);
    setRooms(updatedRooms);
    
    // Update selected rooms
    const updatedSelectedRooms = [...selectedRooms];
    if (!updatedSelectedRooms.includes(pdfRoomName)) {
      updatedSelectedRooms.push(pdfRoomName);
    }
    
    setSelectedRooms(updatedSelectedRooms);
    
    // Set active room to newly created room
    setActiveRoom(pdfRoomName);
    
    // Update stats
    updateStats(updatedAttendanceData, updatedSelectedRooms);
    
    setSuccess(`Successfully extracted ${hallTickets.length} hall tickets from PDF.`);
  };

  // Generate PDF report
  const generatePDF = () => {
    try {
      // Initialize PDF document with portrait orientation
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('SVIT College - Exam Attendance Report', 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      const dateText = new Date().toLocaleDateString();
      doc.text(`Generated on: ${dateText}`, 105, 22, { align: 'center' });
      
      // Add statistics
      doc.setFontSize(13);
      doc.text('Attendance Summary:', 14, 30);
      
      // Create stats table data
      const statsTable = [
        ['Total Students', 'Present', 'Absent', 'Malpractice'],
        [
          stats.totalStudents.toString(), 
          stats.present.toString(), 
          stats.absent.toString(), 
          stats.malpractice.toString()
        ]
      ];
      
      // Add stats table
      doc.autoTable({
        startY: 35,
        head: [statsTable[0]],
        body: [statsTable[1]],
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: { 
          fillColor: [78, 49, 170], 
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { top: 35 }
      });
      
      let yPosition = 0;
      
      // Function to ensure we have space for the next section or create a new page
      const ensureSpace = (neededSpace) => {
        const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 35;
        if (currentY + neededSpace > 270) {
          doc.addPage();
          return 20; // Starting Y position on new page
        }
        return currentY + 15; // Space after the last table
      };
      
      // Process each selected room
      selectedRooms.forEach((room, roomIndex) => {
        const roomData = attendanceData[room] || {};
        if (Object.keys(roomData).length === 0) return;
        
        // Make sure we have enough space for at least the heading and a few rows
        yPosition = ensureSpace(50);
        
        // Add room heading
        doc.setFontSize(13);
        doc.text(`Room: ${room}`, 14, yPosition);
        
        // Create table data for this room
        const tableData = Object.entries(roomData).map(([hallTicket, status]) => [hallTicket, status.toUpperCase()]);
        
        // Add room data table
        doc.autoTable({
          startY: yPosition + 5,
          head: [['Hall Ticket', 'Status']],
          body: tableData,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          headStyles: { 
            fillColor: [78, 49, 170], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, halign: 'center' }
          },
          didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 1) {
              const status = data.cell.raw.toString();
              if (status === 'PRESENT') {
                data.cell.styles.fillColor = [220, 255, 220];
                data.cell.styles.textColor = [0, 100, 0];
              } else if (status === 'ABSENT') {
                data.cell.styles.fillColor = [255, 220, 220];
                data.cell.styles.textColor = [150, 0, 0];
              } else if (status === 'MALPRACTICE') {
                data.cell.styles.fillColor = [255, 240, 200];
                data.cell.styles.textColor = [150, 100, 0];
              }
            }
          }
        });
      });
      
      // Add footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        doc.text('SVIT College - Exam Attendance System', 105, 290, { align: 'center' });
      }
      
      // Save the PDF
      doc.save('SVIT_Exam_Attendance_Report.pdf');
      setSuccess('PDF report generated successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF report. Please try again.');
    }
  };

  return (
    <Container fluid className="exam-attendance-app py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0 header-card">
            <Card.Body className="text-center">
              <h1 className="mb-0">
                <span className="text-primary">SVIT</span> Exam Attendance System
              </h1>
              <p className="text-muted">B.Tech Examination Management - Andhra Pradesh</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="excel" title="Excel Upload">
                  <h5 className="card-title mb-3">Upload Seating Arrangement</h5>
                  <Form.Group>
                    <Form.Label>Select Excel File with Seating Arrangements</Form.Label>
                    <Form.Control 
                      type="file" 
                      accept=".xlsx, .xls" 
                      onChange={handleFileUpload}
                      className="mb-3"
                    />
                    <Form.Text className="text-muted">
                      Upload an Excel file containing sheets with room seating arrangements. 
                      Sheet names should contain "Seating" (e.g., "Room 1_Seating").
                    </Form.Text>
                  </Form.Group>
                </Tab>
                <Tab eventKey="pdf" title="PDF Upload">
                  <PDFUploader onExtractedHallTickets={handleExtractedHallTickets} />
                </Tab>
              </Tabs>
              
              {loading && <Alert variant="info">Processing file, please wait...</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {rooms.length > 0 && (
        <>
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title mb-3">Room Selection</h5>
                  <div className="room-selection d-flex flex-wrap gap-2">
                    {rooms.map(room => (
                      <Form.Check
                        key={room}
                        type="checkbox"
                        id={`room-check-${room}`}
                        label={room}
                        checked={selectedRooms.includes(room)}
                        onChange={() => toggleRoomSelection(room)}
                        className="room-checkbox"
                      />
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title mb-3">Attendance Statistics</h5>
                  <Row>
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
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white">
                  <Nav variant="tabs" className="room-tabs">
                    {selectedRooms.map(room => (
                      <Nav.Item key={room}>
                        <Nav.Link 
                          active={activeRoom === room}
                          onClick={() => handleRoomSelection(room)}
                        >
                          {room}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </Card.Header>
                <Card.Body>
                  {selectedRooms.length === 0 ? (
                    <Alert variant="info">Please select at least one room to view attendance.</Alert>
                  ) : (
                    activeRoom && (
                      <>
                        <h5 className="card-title mb-3">
                          {activeRoom} - Attendance List
                          <BeautifulPDFGenerator 
                            attendanceData={attendanceData}
                            selectedRooms={selectedRooms}
                            stats={stats}
                          />
                        </h5>
                        <Table striped bordered hover responsive className="attendance-table">
                          <thead>
                            <tr>
                              <th width="10%">#</th>
                              <th width="30%">Hall Ticket Number</th>
                              <th width="60%">Attendance Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(attendanceData[activeRoom] || {}).map(([hallTicket, status], index) => (
                              <tr key={hallTicket}>
                                <td>{index + 1}</td>
                                <td>
                                  <code className="hall-ticket">{hallTicket}</code>
                                </td>
                                <td>
                                  <div className="status-buttons">
                                    <Button
                                      variant={status === 'present' ? 'success' : 'outline-success'}
                                      className="me-2"
                                      onClick={() => handleStatusChange(hallTicket, 'present')}
                                    >
                                      Present
                                    </Button>
                                    <Button
                                      variant={status === 'absent' ? 'danger' : 'outline-danger'}
                                      className="me-2"
                                      onClick={() => handleStatusChange(hallTicket, 'absent')}
                                    >
                                      Absent
                                    </Button>
                                    <Button
                                      variant={status === 'malpractice' ? 'warning' : 'outline-warning'}
                                      onClick={() => handleStatusChange(hallTicket, 'malpractice')}
                                    >
                                      Malpractice
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </>
                    )
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      <footer className="text-center mt-5 mb-3">
        <p className="text-muted">© 2025 SVIT College - Exam Attendance System</p>
      </footer>
    </Container>
  );
}

export default App;