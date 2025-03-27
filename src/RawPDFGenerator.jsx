import React from 'react';
import { Button } from 'react-bootstrap';

const RawPDFGenerator = ({ attendanceData, selectedRooms, stats }) => {
  const generatePDF = async () => {
    try {
      // Import jsPDF dynamically to ensure it loads properly
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF;
      
      // Create new document
      const doc = new jsPDF();
      
      // Set initial positions
      let y = 20;
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Helper function to check for page overflow
      const checkPageOverflow = (neededSpace) => {
        if (y + neededSpace > pageHeight - margin) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(78, 49, 170);
      doc.text('SVIT College - Exam Attendance Report', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      // Add date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
      y += 15;
      
      // Add summary stats
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Attendance Summary:', margin, y);
      y += 10;
      
      // Draw summary table manually
      const colWidth = (pageWidth - 2 * margin) / 4;
      
      // Draw table header
      doc.setFillColor(78, 49, 170);
      doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('Total Students', margin + colWidth * 0 + 5, y + 7);
      doc.text('Present', margin + colWidth * 1 + 5, y + 7);
      doc.text('Absent', margin + colWidth * 2 + 5, y + 7);
      doc.text('Malpractice', margin + colWidth * 3 + 5, y + 7);
      
      y += 10;
      
      // Draw table data row
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(stats.totalStudents.toString(), margin + colWidth * 0 + 5, y + 7);
      doc.text(stats.present.toString(), margin + colWidth * 1 + 5, y + 7);
      doc.text(stats.absent.toString(), margin + colWidth * 2 + 5, y + 7);
      doc.text(stats.malpractice.toString(), margin + colWidth * 3 + 5, y + 7);
      
      y += 20;
      
      // Process each room
      selectedRooms.forEach((room) => {
        // Check if need new page
        checkPageOverflow(60);
        
        // Add room header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(78, 49, 170);
        doc.text(`Room: ${room}`, margin, y);
        y += 10;
        
        // Extract room data
        const roomData = attendanceData[room] || {};
        
        // Prepare lists by status
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
        
        // Helper to add a status section
        const addStatusSection = (title, students, fillColor, textColor) => {
          if (students.length === 0) return;
          
          // Check if need new page
          checkPageOverflow(10 + students.length * 7);
          
          // Add header
          doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
          doc.rect(margin, y, pageWidth / 3 - 10, 8, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.text(`${title} (${students.length})`, margin + 5, y + 6);
          
          y += 10;
          
          // Add students
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          
          students.forEach((hallTicket) => {
            doc.text(hallTicket, margin + 5, y);
            y += 6;
          });
          
          // Reset Y to allow side-by-side sections
          y -= (students.length * 6 + 10);
        };
        
        // Add status sections side by side
        addStatusSection('Present', presentStudents, [220, 255, 220], [0, 100, 0]);
        
        // Move to next column
        doc.text('', pageWidth / 3 + margin, y);
        
        // Add absent section in second column
        addStatusSection('Absent', absentStudents, [255, 220, 220], [150, 0, 0]);
        
        // Move to third column
        doc.text('', 2 * pageWidth / 3 + margin, y);
        
        // Add malpractice section in third column
        addStatusSection('Malpractice', malpracticeStudents, [255, 240, 200], [150, 100, 0]);
        
        // Calculate how far down we need to move to clear all three columns
        const maxCount = Math.max(
          presentStudents.length,
          absentStudents.length,
          malpracticeStudents.length
        );
        
        y += (maxCount * 6 + 20);
        
        // Add separator
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y - 10, pageWidth - margin, y - 10);
      });
      
      // Add footer on each page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${totalPages} - SVIT College Exam Attendance System`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      doc.save('SVIT_Exam_Attendance_Report.pdf');
      
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF: ' + error.message);
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

export default RawPDFGenerator;