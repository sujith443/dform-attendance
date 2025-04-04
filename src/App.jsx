import React, { useState, useEffect } from "react";
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
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import BeautifulPDFGenerator from "./BeautifulPDFGenerator";
import EditableTableView from "./EditableTableView";
import DFormPDFGenerator from "./DFormPDFGenerator";

function App() {
  const [file, setFile] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [stats, setStats] = useState({
    totalStudents: 0,
    present: 0,
    absent: 0,
    malpractice: 0
  });
  const [examDetails, setExamDetails] = useState({
    examName: "B.Tech Regular Examinations",
    regulation: "R20",
    subjectCode: "",
    subjectName: "",
    examDate: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear(),
    semester: '1',
    branch: ""
  });
  const [appView, setAppView] = useState("rooms"); // "rooms" or "branches"

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
        const workbook = XLSX.read(data, { type: "array" });

        // Filter sheets that have "Seating" in their name
        const seatingSheets = workbook.SheetNames.filter((name) =>
          name.includes("Seating")
        );

        if (seatingSheets.length === 0) {
          setError("No seating sheets found in the uploaded file.");
          setLoading(false);
          return;
        }

        // Extract hall ticket numbers from each seating sheet
        const roomsData = {};
        const allRooms = [];

        seatingSheets.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Extract room name from sheet name
          const roomName = sheetName.trim();
          allRooms.push(roomName);

          // Extract hall ticket numbers (assuming they're 10 characters with mix of letters and numbers)
          const hallTickets = [];

          sheetData.forEach((row) => {
            if (!row) return;

            row.forEach((cell) => {
              if (
                (cell && typeof cell === "string") ||
                typeof cell === "number"
              ) {
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
            acc[ticket] = "present";
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
        console.error("Error processing file:", err);
        setError(
          "Error processing the Excel file. Please make sure it is a valid Excel file."
        );
      }

      setLoading(false);
    };

    reader.onerror = () => {
      setError("Error reading the file. Please try again.");
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
      ? selectedRooms.filter((r) => r !== room)
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
      malpractice: 0,
    };

    selectedRooms.forEach((room) => {
      const roomData = data[room] || {};
      Object.values(roomData).forEach((status) => {
        newStats.totalStudents++;
        if (status === "present") newStats.present++;
        else if (status === "absent") newStats.absent++;
        else if (status === "malpractice") newStats.malpractice++;
      });
    });

    setStats(newStats);
  };

  return (
    <Container fluid className="exam-attendance-app py-4">
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0 header-card">
            <Card.Body className="text-center">
              <h1 className="mb-0">
                <span className="text-primary">SVIT</span> Exam Attendance
                System
              </h1>
              <p className="text-muted">
                B.Tech Examination Management - Andhra Pradesh
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title mb-3">
                Upload Seating Arrangement
              </h5>
              <Form.Group>
                <Form.Label>
                  Select Excel File with Seating Arrangements
                </Form.Label>
                <Form.Control
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="mb-3"
                />
                <Form.Text className="text-muted">
                  Upload an Excel file containing sheets with room seating
                  arrangements. Sheet names should contain "Seating" (e.g.,
                  "Room 1_Seating"). Hall ticket numbers should be 10-character alphanumeric strings.
                </Form.Text>
              </Form.Group>

              {loading && (
                <Alert variant="info">Processing file, please wait...</Alert>
              )}
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert
                  variant="success"
                  dismissible
                  onClose={() => setSuccess(null)}
                >
                  {success}
                </Alert>
              )}
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
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">View Options</h5>
                    <div>
                      <Button
                        variant={appView === "rooms" ? "primary" : "outline-primary"}
                        onClick={() => setAppView("rooms")}
                        className="me-2"
                      >
                        Room View
                      </Button>
                      <Button
                        variant={appView === "branches" ? "primary" : "outline-primary"}
                        onClick={() => setAppView("branches")}
                      >
                        Branch View
                      </Button>
                    </div>
                  </div>
                  
                  {appView === "rooms" && (
                    <div className="room-selection d-flex flex-wrap gap-2">
                      <h5 className="me-3">Room Selection:</h5>
                      {rooms.map((room) => (
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
                  )}
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

          {appView === "branches" ? (
            <EditableTableView 
              attendanceData={attendanceData} 
              setAttendanceData={setAttendanceData} 
              stats={stats}
              examDetails={examDetails}
              setExamDetails={setExamDetails}
            />
          ) : (
            <Row>
              <Col md={12}>
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <Nav variant="tabs" className="room-tabs">
                        {selectedRooms.map((room) => (
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
                      <div>
                        <BeautifulPDFGenerator
                          attendanceData={attendanceData}
                          selectedRooms={selectedRooms}
                          stats={stats}
                        />
                        <DFormPDFGenerator
                          attendanceData={attendanceData}
                          examDetails={examDetails}
                        />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {selectedRooms.length === 0 ? (
                      <Alert variant="info">
                        Please select at least one room to view attendance.
                      </Alert>
                    ) : (
                      activeRoom && (
                        <>
                          <h5 className="card-title mb-3">
                            {activeRoom} - Attendance List
                          </h5>
                          <Table
                            striped
                            bordered
                            hover
                            responsive
                            className="attendance-table"
                          >
                            <thead>
                              <tr>
                                <th width="10%">#</th>
                                <th width="30%">Hall Ticket Number</th>
                                <th width="60%">Attendance Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(
                                attendanceData[activeRoom] || {}
                              ).map(([hallTicket, status], index) => (
                                <tr key={hallTicket} className={
                                  status === 'absent' ? 'table-danger fw-bold' : 
                                  status === 'malpractice' ? 'table-warning fw-bold' : ''
                                }>
                                  <td>{index + 1}</td>
                                  <td>
                                    <code className="hall-ticket">
                                      {hallTicket}
                                    </code>
                                    <small className="text-muted d-block">
                                      Branch: {hallTicket.slice(6, 8)}
                                    </small>
                                  </td>
                                  <td>
                                    <div className="status-buttons">
                                      <Button
                                        variant={
                                          status === "present"
                                            ? "success"
                                            : "outline-success"
                                        }
                                        className="me-2"
                                        onClick={() =>
                                          handleStatusChange(
                                            hallTicket,
                                            "present"
                                          )
                                        }
                                      >
                                        Present
                                      </Button>
                                      <Button
                                        variant={
                                          status === "absent"
                                            ? "danger"
                                            : "outline-danger"
                                        }
                                        className="me-2"
                                        onClick={() =>
                                          handleStatusChange(hallTicket, "absent")
                                        }
                                      >
                                        Absent
                                      </Button>
                                      <Button
                                        variant={
                                          status === "malpractice"
                                            ? "warning"
                                            : "outline-warning"
                                        }
                                        onClick={() =>
                                          handleStatusChange(
                                            hallTicket,
                                            "malpractice"
                                          )
                                        }
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
          )}
        </>
      )}

      <footer className="text-center mt-5 mb-3">
        <p className="text-muted">
          © 2025 SVIT College - Exam Attendance System
        </p>
      </footer>
    </Container>
  );
}

export default App;