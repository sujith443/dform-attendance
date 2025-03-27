// This utility generates PDF attendance reports
// In a real application, we would use a PDF generation library like jsPDF or pdfmake

// Simulate PDF generation with a class
class PDFGenerator {
    /**
     * Generate and download an attendance report as PDF
     * @param {Object} data - Complete data object with exam info, rooms, and student data
     * @returns {Promise} - Resolves when PDF is generated and downloaded
     */
    static async generateAttendanceReport(data) {
      return new Promise((resolve, reject) => {
        try {
          const { examInfo, rooms, roomDetails, students, summary } = data;
          
          // In a real application, we would use a PDF library here
          // For this demo, we'll create a simple HTML representation and convert it to a Blob
          
          const pdfContent = this.createPDFContent(data);
          
          // Create a Blob from the HTML content
          const blob = new Blob([pdfContent], { type: 'text/html' });
          
          // Create a download link and trigger download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `SVIT_Attendance_Report_${examInfo.date.replace(/\//g, '-')}.html`;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve();
          }, 100);
        } catch (error) {
          reject(error);
        }
      });
    }
    
    /**
     * Create PDF content as HTML
     * @param {Object} data - Complete data object
     * @returns {string} - HTML content for the PDF
     */
    static createPDFContent(data) {
      const { examInfo, rooms, roomDetails, students } = data;
      
      // Get students by room
      const studentsByRoom = {};
      rooms.forEach(room => {
        studentsByRoom[room] = students.filter(student => student.room === room);
      });
      
      // Get attendance statistics by room
      const statsByRoom = {};
      rooms.forEach(room => {
        const roomStudents = studentsByRoom[room];
        const total = roomStudents.length;
        const present = roomStudents.filter(s => s.status === 'Present').length;
        const absent = roomStudents.filter(s => s.status === 'Absent').length;
        const malpractice = roomStudents.filter(s => s.status === 'Malpractice').length;
        
        statsByRoom[room] = { total, present, absent, malpractice };
      });
      
      // Create HTML content for PDF with Bootstrap styling
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SVIT Attendance Report</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .table-bordered th, .table-bordered td {
              border: 1px solid #dee2e6;
            }
            .signature-container {
              margin-top: 50px;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 200px;
              display: inline-block;
              margin-top: 50px;
            }
            @media print {
              .page-break {
                page-break-after: always;
              }
              .badge {
                border: none !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 class="mb-1">JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY</h2>
            <h3 class="mb-1">SRI VENKATESWARA INSTITUTE OF TECHNOLOGY</h3>
            <h4 class="mb-3">EXAM ATTENDANCE REPORT</h4>
            <p class="mb-1">${examInfo.title}</p>
            <p class="mb-1">Date: ${examInfo.date}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Attendance Summary</h5>
            </div>
            <div class="card-body">
              <table class="table table-bordered">
                <thead>
                  <tr class="table-light">
                    <th>Room</th>
                    <th>Total Students</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Malpractice</th>
                    <th>Present %</th>
                  </tr>
                </thead>
                <tbody>
      `;
      
      // Add summary rows for each room
      rooms.forEach(room => {
        const stats = statsByRoom[room];
        const presentPercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : '0.00';
        
        html += `
          <tr>
            <td>${room}</td>
            <td>${stats.total}</td>
            <td>${stats.present}</td>
            <td>${stats.absent}</td>
            <td>${stats.malpractice}</td>
            <td>${presentPercentage}%</td>
          </tr>
        `;
      });
      
      // Add total row
      const totalStudents = students.length;
      const totalPresent = students.filter(s => s.status === 'Present').length;
      const totalAbsent = students.filter(s => s.status === 'Absent').length;
      const totalMalpractice = students.filter(s => s.status === 'Malpractice').length;
      const totalPresentPercentage = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(2) : '0.00';
      
      html += `
                <tr class="table-secondary">
                  <th>Total</th>
                  <th>${totalStudents}</th>
                  <th>${totalPresent}</th>
                  <th>${totalAbsent}</th>
                  <th>${totalMalpractice}</th>
                  <th>${totalPresentPercentage}%</th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      
      // Add detailed section for each room
      rooms.forEach((room, index) => {
        const roomStudents = studentsByRoom[room];
        const roomConfig = roomDetails[room]?.configuration || { rows: 0, columns: 0 };
        
        html += `
          <div class="${index < rooms.length - 1 ? 'page-break' : ''}">
            <div class="card mb-4">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">${room} - Attendance Details</h5>
              </div>
              <div class="card-body">
                <p>Room Configuration: ${roomConfig.rows} Rows × ${roomConfig.columns} Columns</p>
                
                <div class="row mb-4">
                  <div class="col-md-3 mb-3">
                    <div class="card bg-light">
                      <div class="card-body text-center">
                        <h4>${roomStudents.length}</h4>
                        <p class="mb-0">Total Students</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 mb-3">
                    <div class="card bg-success text-white">
                      <div class="card-body text-center">
                        <h4>${roomStudents.filter(s => s.status === 'Present').length}</h4>
                        <p class="mb-0">Present</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 mb-3">
                    <div class="card bg-danger text-white">
                      <div class="card-body text-center">
                        <h4>${roomStudents.filter(s => s.status === 'Absent').length}</h4>
                        <p class="mb-0">Absent</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3 mb-3">
                    <div class="card bg-warning">
                      <div class="card-body text-center">
                        <h4>${roomStudents.filter(s => s.status === 'Malpractice').length}</h4>
                        <p class="mb-0">Malpractice</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <table class="table table-bordered table-striped">
                  <thead>
                    <tr class="table-primary">
                      <th>S.No</th>
                      <th>Hall Ticket</th>
                      <th>Branch</th>
                      <th>Seating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
        `;
        
        // Add rows for each student in the room
        roomStudents.forEach((student, idx) => {
          const statusClass = 
            student.status === 'Present' ? 'bg-success text-white' :
            student.status === 'Absent' ? 'bg-danger text-white' :
            student.status === 'Malpractice' ? 'bg-warning' : '';
          
          html += `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${student.hallTicket}</strong></td>
              <td>${student.branch}</td>
              <td>${student.seating}</td>
              <td class="${statusClass}">${student.status}</td>
            </tr>
          `;
        });
        
        html += `
                  </tbody>
                </table>
                
                <div class="card mt-4">
                  <div class="card-header bg-light">
                    <h5 class="mb-0">ATTENDANCE SUMMARY</h5>
                  </div>
                  <div class="card-body">
                    <table class="table">
                      <tr>
                        <td>No of Students Allotted:</td>
                        <td>${roomStudents.length}</td>
                      </tr>
                      <tr>
                        <td>No of Students Absent:</td>
                        <td>${roomStudents.filter(s => s.status === 'Absent').length}</td>
                      </tr>
                      <tr>
                        <td>No of Students Present:</td>
                        <td>${roomStudents.filter(s => s.status === 'Present').length}</td>
                      </tr>
                      <tr>
                        <td>No of Malpractice Cases:</td>
                        <td>${roomStudents.filter(s => s.status === 'Malpractice').length}</td>
                      </tr>
                    </table>
                  </div>
                </div>
                
                <div class="row signature-container">
                  <div class="col-6 text-center">
                    <div class="signature-line"></div>
                    <p>Invigilator Signature</p>
                  </div>
                  <div class="col-6 text-center">
                    <div class="signature-line"></div>
                    <p>Principal Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      html += `
        </body>
        </html>
      `;
      
      return html;
    }
  }
  
  export default PDFGenerator;