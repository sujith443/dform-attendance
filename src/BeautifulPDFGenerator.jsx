import React from 'react';
import { Button } from 'react-bootstrap';

const BeautifulPDFGenerator = ({ attendanceData, selectedRooms, stats }) => {
  const generatePDF = async () => {
    try {
      // Import jsPDF dynamically
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
      
      // Add SVIT logo placeholder (circle with text)
      doc.setFillColor(78, 49, 170);
      doc.circle(pageWidth / 2, y + 15, 15, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text("SVIT", pageWidth / 2, y + 15 + 4, { align: 'center' });
      
      y += 40;
      
      // Add title with decorative line
      doc.setFontSize(22);
      doc.setTextColor(78, 49, 170);
      doc.text('EXAM ATTENDANCE REPORT', pageWidth / 2, y, { align: 'center' });
      
      // Add decorative lines
      doc.setDrawColor(78, 49, 170);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 8, pageWidth - margin, y + 8);
      doc.setLineWidth(2);
      doc.line(pageWidth / 2 - 30, y + 13, pageWidth / 2 + 30, y + 13);
      
      y += 20;
      
      // Add college info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text('SRI VENKATESWARA INSTITUTE OF TECHNOLOGY', pageWidth / 2, y, { align: 'center' });
      y += 7;
      doc.setFontSize(10);
      doc.text('HAMPAPURAM, ANANTAPUR', pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      
      // Add date in a styled box
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(pageWidth / 2 - 40, y, 80, 10, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y + 7, { align: 'center' });
      
      y += 25;
      
      // Add summary box with statistics
      doc.setDrawColor(78, 49, 170);
      doc.setFillColor(250, 250, 255);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 60, 3, 3, 'FD');
      
      // Add summary title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(78, 49, 170);
      doc.text('ATTENDANCE SUMMARY', pageWidth / 2, y + 15, { align: 'center' });
      
      // Add stats in columns
      y += 30;
      const colWidth = (pageWidth - 2 * margin) / 4;
      
      // Total Students
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(60, 60, 60);
      doc.text(stats.totalStudents.toString(), margin + colWidth * 0.5, y, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Total Students', margin + colWidth * 0.5, y + 10, { align: 'center' });
      
      // Present
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(46, 184, 46);
      doc.text(stats.present.toString(), margin + colWidth * 1.5, y, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('Present', margin + colWidth * 1.5, y + 10, { align: 'center' });
      
      // Absent
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(220, 53, 69);
      doc.text(stats.absent.toString(), margin + colWidth * 2.5, y, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('Absent', margin + colWidth * 2.5, y + 10, { align: 'center' });
      
      // Malpractice
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 153, 0);
      doc.text(stats.malpractice.toString(), margin + colWidth * 3.5, y, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('Malpractice', margin + colWidth * 3.5, y + 10, { align: 'center' });
      
      // Calculate percentages
      const presentPercent = stats.totalStudents ? Math.round(stats.present / stats.totalStudents * 100) : 0;
      const absentPercent = stats.totalStudents ? Math.round(stats.absent / stats.totalStudents * 100) : 0;
      const malpracticePercent = stats.totalStudents ? Math.round(stats.malpractice / stats.totalStudents * 100) : 0;
      
      y += 25;
      
      // Add percentage bars
      const barY = y + 10;
      const barHeight = 6;
      const barWidth = pageWidth - 2 * margin - 4;
      
      // Background bar
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin + 2, barY, barWidth, barHeight, 2, 2, 'F');
      
      // Present bar (green)
      if (presentPercent > 0) {
        doc.setFillColor(46, 184, 46);
        doc.roundedRect(margin + 2, barY, barWidth * (presentPercent / 100), barHeight, 2, 2, 'F');
      }
      
      // Absent bar (red) - starts after present
      if (absentPercent > 0) {
        doc.setFillColor(220, 53, 69);
        doc.roundedRect(
          margin + 2 + barWidth * (presentPercent / 100), 
          barY, 
          barWidth * (absentPercent / 100), 
          barHeight, 
          0, 0, 'F'
        );
      }
      
      // Malpractice bar (orange) - starts after present + absent
      if (malpracticePercent > 0) {
        doc.setFillColor(255, 153, 0);
        doc.roundedRect(
          margin + 2 + barWidth * ((presentPercent + absentPercent) / 100), 
          barY, 
          barWidth * (malpracticePercent / 100), 
          barHeight, 
          0, 0, 'F'
        );
      }
      
      // Add percentage labels
      doc.setFontSize(8);
      if (presentPercent >= 10) {
        doc.setTextColor(255, 255, 255);
        doc.text(
          `${presentPercent}%`, 
          margin + 2 + (barWidth * (presentPercent / 100)) / 2, 
          barY + 4,
          { align: 'center' }
        );
      }
      
      if (absentPercent >= 10) {
        doc.setTextColor(255, 255, 255);
        doc.text(
          `${absentPercent}%`, 
          margin + 2 + barWidth * (presentPercent / 100) + (barWidth * (absentPercent / 100)) / 2, 
          barY + 4,
          { align: 'center' }
        );
      }
      
      if (malpracticePercent >= 10) {
        doc.setTextColor(255, 255, 255);
        doc.text(
          `${malpracticePercent}%`, 
          margin + 2 + barWidth * ((presentPercent + absentPercent) / 100) + (barWidth * (malpracticePercent / 100)) / 2, 
          barY + 4,
          { align: 'center' }
        );
      }
      
      y += 25;
      
      // Process each room
      selectedRooms.forEach((room, roomIndex) => {
        // Check if need new page
        checkPageOverflow(60);
        
        // Add room header with decorative background
        doc.setFillColor(245, 245, 255);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 2, 2, 'F');
        
        // Add room name
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(78, 49, 170);
        doc.text(`Room: ${room}`, margin + 10, y + 13);
        
        // Add count indicators
        const roomData = attendanceData[room] || {};
        const presentCount = Object.values(roomData).filter(status => status === 'present').length;
        const absentCount = Object.values(roomData).filter(status => status === 'absent').length;
        const malpracticeCount = Object.values(roomData).filter(status => status === 'malpractice').length;
        
        const countText = `Total: ${Object.keys(roomData).length} | Present: ${presentCount} | Absent: ${absentCount} | Malpractice: ${malpracticeCount}`;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(countText, pageWidth - margin - 10, y + 13, { align: 'right' });
        
        y += 30;
        
        // Prepare data for sections
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
        
        // Start with most relevant sections (based on count)
        const sections = [
          {
            title: 'PRESENT STUDENTS',
            students: presentStudents,
            fillColor: [230, 255, 230],
            borderColor: [46, 184, 46],
            textColor: [0, 100, 0]
          },
          {
            title: 'ABSENT STUDENTS',
            students: absentStudents,
            fillColor: [255, 235, 235],
            borderColor: [220, 53, 69],
            textColor: [150, 0, 0]
          },
          {
            title: 'MALPRACTICE STUDENTS',
            students: malpracticeStudents,
            fillColor: [255, 245, 225],
            borderColor: [255, 153, 0],
            textColor: [150, 80, 0]
          }
        ];
        
        // Sort sections by student count (descending)
        sections.sort((a, b) => b.students.length - a.students.length);
        
        // Check if we need a new page before starting
        const maxStudents = Math.max(
          presentStudents.length,
          absentStudents.length,
          malpracticeStudents.length
        );
        
        // Estimate space needed
        const estimatedHeight = Math.min(maxStudents, 10) * 6 + 30; // 30 for headers, 6 per student
        checkPageOverflow(estimatedHeight);
        
        // Draw attendance sections
        sections.forEach(section => {
          if (section.students.length === 0) return;
          
          // Check if we need a new page
          checkPageOverflow(Math.min(section.students.length, 10) * 6 + 25);
          
          // Add section header
          doc.setFillColor(section.fillColor[0], section.fillColor[1], section.fillColor[2]);
          doc.setDrawColor(section.borderColor[0], section.borderColor[1], section.borderColor[2]);
          doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'FD');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(section.textColor[0], section.textColor[1], section.textColor[2]);
          doc.text(`${section.title} (${section.students.length})`, margin + 10, y + 12);
          
          y += 25;
          
          // Draw student list in columns
          const studentsPerColumn = Math.ceil(section.students.length / 3);
          const colWidth = (pageWidth - 2 * margin) / 3;
          
          let currentY = y;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
          
          section.students.forEach((hallTicket, index) => {
            const column = Math.floor(index / studentsPerColumn);
            const xPos = margin + 5 + column * colWidth;
            const yPos = currentY + (index % studentsPerColumn) * 6;
            
            // Check if we need to start a new page for this entry
            if (yPos > pageHeight - margin && index > 0) {
              doc.addPage();
              // Reset positioning for the new page
              currentY = 20;
              
              // Add continuation header
              doc.setFillColor(section.fillColor[0], section.fillColor[1], section.fillColor[2]);
              doc.setDrawColor(section.borderColor[0], section.borderColor[1], section.borderColor[2]);
              doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 18, 2, 2, 'FD');
              
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(11);
              doc.setTextColor(section.textColor[0], section.textColor[1], section.textColor[2]);
              doc.text(`${section.title} (continued)`, margin + 10, currentY + 12);
              
              currentY += 25;
              
              // Recalculate position for this entry
              const newColumn = Math.floor(index / studentsPerColumn);
              const newXPos = margin + 5 + newColumn * colWidth;
              const newYPos = currentY + (index % studentsPerColumn) * 6;
              
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(60, 60, 60);
              doc.text(`•  ${hallTicket}`, newXPos, newYPos);
            } else {
              doc.text(`•  ${hallTicket}`, xPos, yPos);
            }
          });
          
          // Calculate next Y position based on the most entries in a column
          const columnsNeeded = Math.min(3, Math.ceil(section.students.length / studentsPerColumn));
          const entriesInLastColumn = section.students.length - (columnsNeeded - 1) * studentsPerColumn;
          const rowsInLastColumn = entriesInLastColumn > 0 ? entriesInLastColumn : studentsPerColumn;
          
          y = currentY + rowsInLastColumn * 6 + 15;
        });
        
        // Add separator between rooms if not the last room
        if (roomIndex < selectedRooms.length - 1) {
          checkPageOverflow(25);
          doc.setDrawColor(200, 200, 200);
          doc.setLineDashPattern([3, 2], 0);
          doc.line(margin + 20, y, pageWidth - margin - 20, y);
          doc.setLineDashPattern([], 0);
          y += 20;
        }
      });
      
      // Add footer on each page with logo and page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Add line
        doc.setDrawColor(78, 49, 170);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Add logo circle
        doc.setFillColor(78, 49, 170);
        doc.circle(margin + 5, pageHeight - 10, 3, 'F');
        
        // Add page info
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `SVIT College - Exam Attendance Report | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        // Add date on the right
        doc.text(
          new Date().toLocaleDateString(),
          pageWidth - margin - 5,
          pageHeight - 10,
          { align: 'right' }
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

export default BeautifulPDFGenerator;