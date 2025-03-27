import React from 'react';
import { Button } from 'react-bootstrap';
import html2canvas from 'html2canvas';

const DirectPDFExport = ({ attendanceData, selectedRooms, stats }) => {
  const generatePDF = async () => {
    try {
      // Create a temporary div to render the content
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-export-container';
      document.body.appendChild(tempDiv);
      
      // Style the container
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      // Add title
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `
        <h1 style="text-align: center; color: #4e31aa;">SVIT College - Exam Attendance Report</h1>
        <p style="text-align: center;">Generated on: ${new Date().toLocaleDateString()}</p>
        <hr>
      `;
      tempDiv.appendChild(titleDiv);
      
      // Add summary
      const summaryDiv = document.createElement('div');
      summaryDiv.innerHTML = `
        <h2>Attendance Summary</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #4e31aa; color: white;">
            <th style="padding: 8px; border: 1px solid #ddd;">Total Students</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Present</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Absent</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Malpractice</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${stats.totalStudents}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; background-color: #d4edda;">${stats.present}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; background-color: #f8d7da;">${stats.absent}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; background-color: #fff3cd;">${stats.malpractice}</td>
          </tr>
        </table>
      `;
      tempDiv.appendChild(summaryDiv);
      
      // Add room data
      selectedRooms.forEach(room => {
        const roomData = attendanceData[room] || {};
        
        // Separate students by status
        const presentStudents = [];
        const absentStudents = [];
        const malpracticeStudents = [];
        
        Object.entries(roomData).forEach(([hallTicket, status]) => {
          if (status === 'present') {
            presentStudents.push(hallTicket);
          } else if (status === 'absent') {
            absentStudents.push(hallTicket);
          } else if (status === 'malpractice') {
            malpracticeStudents.push(hallTicket);
          }
        });
        
        // Create room section
        const roomDiv = document.createElement('div');
        roomDiv.innerHTML = `
          <h2 style="background-color: #f8f9fa; padding: 10px; margin-top: 20px;">Room: ${room}</h2>
          
          <div style="display: flex; margin-bottom: 20px;">
            <div style="flex: 1; margin-right: 10px;">
              <h3 style="background-color: #d4edda; padding: 5px;">Present (${presentStudents.length})</h3>
              <ul style="list-style-type: none; padding-left: 10px;">
                ${presentStudents.map(ticket => `<li style="margin-bottom: 5px;">${ticket}</li>`).join('')}
              </ul>
            </div>
            
            <div style="flex: 1; margin-right: 10px;">
              <h3 style="background-color: #f8d7da; padding: 5px;">Absent (${absentStudents.length})</h3>
              <ul style="list-style-type: none; padding-left: 10px;">
                ${absentStudents.map(ticket => `<li style="margin-bottom: 5px;">${ticket}</li>`).join('')}
              </ul>
            </div>
            
            <div style="flex: 1;">
              <h3 style="background-color: #fff3cd; padding: 5px;">Malpractice (${malpracticeStudents.length})</h3>
              <ul style="list-style-type: none; padding-left: 10px;">
                ${malpracticeStudents.map(ticket => `<li style="margin-bottom: 5px;">${ticket}</li>`).join('')}
              </ul>
            </div>
          </div>
          <hr>
        `;
        tempDiv.appendChild(roomDiv);
      });
      
      // Add footer
      const footerDiv = document.createElement('div');
      footerDiv.innerHTML = `
        <p style="text-align: center; margin-top: 20px; color: #6c757d;">
          © 2025 SVIT College - Exam Attendance System
        </p>
      `;
      tempDiv.appendChild(footerDiv);
      
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      
      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 1,
        useCORS: true,
        logging: false
      });
      
      // Create PDF from canvas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save PDF
      pdf.save('SVIT_Exam_Attendance_Report.pdf');
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try an alternative method.');
      return false;
    }
  };

  return (
    <Button 
      variant="primary" 
      onClick={generatePDF}
      className="float-end"
    >
      Generate Report PDF
    </Button>
  );
};

export default DirectPDFExport;