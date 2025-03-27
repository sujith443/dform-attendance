import React from 'react';
import { Button } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const PDFGenerator = ({ attendanceData, selectedRooms, stats }) => {
  const generatePDF = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('SVIT College - Exam Attendance Report', 105, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      const dateStr = new Date().toLocaleDateString();
      doc.text(`Date: ${dateStr}`, 105, 30, { align: 'center' });
      
      // Add summary table
      doc.autoTable({
        startY: 40,
        head: [['Total Students', 'Present', 'Absent', 'Malpractice']],
        body: [[
          stats.totalStudents, 
          stats.present, 
          stats.absent, 
          stats.malpractice
        ]],
        theme: 'grid',
        headStyles: { 
          fillColor: [78, 49, 170],
          textColor: [255, 255, 255]
        }
      });
      
      let currentY = doc.lastAutoTable.finalY + 20;
      
      // Add data for each room
      selectedRooms.forEach(room => {
        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        
        // Add room header
        doc.setFontSize(14);
        doc.text(`Room: ${room}`, 14, currentY);
        currentY += 10;
        
        // Get room data
        const roomData = attendanceData[room] || {};
        const tableData = Object.entries(roomData).map(([hallTicket, status]) => 
          [hallTicket, status.toUpperCase()]
        );
        
        if (tableData.length > 0) {
          // Add table for this room
          doc.autoTable({
            startY: currentY,
            head: [['Hall Ticket Number', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { 
              fillColor: [78, 49, 170],
              textColor: [255, 255, 255]
            },
            willDrawCell: function(data) {
              if (data.section === 'body' && data.column.index === 1) {
                const status = data.cell.raw;
                if (status === 'PRESENT') {
                  doc.setFillColor(200, 250, 200);
                } else if (status === 'ABSENT') {
                  doc.setFillColor(250, 200, 200);
                } else if (status === 'MALPRACTICE') {
                  doc.setFillColor(250, 230, 180);
                }
              }
            }
          });
          
          currentY = doc.lastAutoTable.finalY + 20;
        } else {
          doc.setFontSize(12);
          doc.text('No data available for this room', 14, currentY);
          currentY += 15;
        }
      });
      
      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('SVIT College - Exam Attendance System', 105, 295, { align: 'center' });
      }
      
      // Save the PDF file
      doc.save('SVIT_Exam_Attendance_Report.pdf');
      
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      return false;
    }
  };

  return (
    <Button 
      variant="primary" 
      onClick={generatePDF}
      className="pdf-export-btn"
    >
      Generate Report PDF
    </Button>
  );
};

export default PDFGenerator;