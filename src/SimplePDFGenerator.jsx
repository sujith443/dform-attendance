import React from 'react';
import { Button } from 'react-bootstrap';

const SingleBranchPDFGenerator = ({ attendanceData, examDetails, branchCode }) => {
  // Extract branch code from hall ticket
  const extractBranchCode = (hallTicket) => {
    if (hallTicket && typeof hallTicket === 'string' && hallTicket.length >= 8) {
      return hallTicket.slice(6, 8);
    }
    return "00";
  };

  // Helper function to get branch name from branch code
  const getBranchName = (branchCode) => {
    const branchNames = {
      "01": "CIVIL ENGINEERING",
      "02": "ELECTRICAL & ELECTRONICS ENGINEERING",
      "03": "MECHANICAL ENGINEERING",
      "04": "ELECTRONICS & COMMUNICATION ENGINEERING",
      "05": "COMPUTER SCIENCE & ENGINEERING",
      "12": "INFORMATION TECHNOLOGY",
      "42": "ARTIFICIAL INTELLIGENCE",
      "66": "DATA SCIENCE"
    };
    
    return branchNames[branchCode] || `BRANCH ${branchCode}`;
  };

  // Generate D-Form for this specific branch
  const generatePDF = async () => {
    try {
      // Import jsPDF dynamically
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF;

      // Filter students by branch code
      const branchStudents = [];
      Object.entries(attendanceData).forEach(([room, students]) => {
        Object.entries(students).forEach(([hallTicket, status]) => {
          if (extractBranchCode(hallTicket) === branchCode) {
            branchStudents.push({
              hallTicket,
              status,
              room
            });
          }
        });
      });
      
      // Sort students by hall ticket
      branchStudents.sort((a, b) => a.hallTicket.localeCompare(b.hallTicket));
      
      // Skip if no students found for this branch
      if (branchStudents.length === 0) {
        alert(`No students found for branch code ${branchCode}`);
        return false;
      }
      
      // Create new document in portrait orientation
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Constants for layout
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let y = margin;
      
      // Add header content
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Jawaharlal Nehru Technological University, Anantapur – 515 002', pageWidth / 2, y, { align: 'center' });
      
      y += 7;
      
      // Add SVIT College name in bold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('SRI VENKATESWARA INSTITUTE OF TECHNOLOGY', pageWidth / 2, y, { align: 'center' });
      
      y += 6;
      
      // Add location
      doc.setFontSize(10);
      doc.text('HAMPAPURAM - ANANTAPUR', pageWidth / 2, y, { align: 'center' });
      
      y += 10;
      
      // Add D-Form heading and create border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      
      // Draw border around the entire form
      doc.rect(margin, margin, pageWidth - 2 * margin, 28);
      
      // Add right side box for branch code
      doc.setLineWidth(0.5);
      doc.rect(pageWidth - margin - 50, margin, 50, 28);
      
      // Add D-FORM text centered
      doc.setFontSize(12);
      doc.text('D - FORM', pageWidth / 2, y, { align: 'center' });
      
      y += 8;
      
      // Add branch information
      const branchName = getBranchName(branchCode);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`BRANCH: ${branchName}`, margin + 5, y);
      
      // Add branch code on right side
      doc.text(`BRANCH CODE: ${branchCode}`, pageWidth - margin - 25, y, { align: 'center' });
      
      y += 8;
      
      // Add exam name
      doc.text(`NAME OF THE EXAMINATION :: ${examDetails.examName || 'B.Tech Regular Examinations'} - ${examDetails.regulation || 'R20'}`, margin + 5, y);
      
      y += 6;
      
      // Add subject details
      doc.text(`NAME OF THE SUBJECT & SUBJECT CODE :: ${examDetails.subjectName || '_______'} - ${examDetails.subjectCode || '_______'}`, margin + 5, y);
      
      // Add regulation on the right
      doc.text(`Regulation: ${examDetails.regulation || 'R20'}`, pageWidth - margin - 25, y);
      
      y += 6;
      
      // Add date
      const examDate = examDetails.examDate ? new Date(examDetails.examDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/') : '___/___/____';
      
      doc.text(`DATE OF THE EXAMINATION :: ${examDate}`, margin + 5, y);
      
      // Add session on the right (default to FN)
      doc.text(`SESSION: FN`, pageWidth - margin - 25, y);
      
      y += 10;
      
      // Add hall ticket list heading
      doc.setFont('helvetica', 'italic');
      doc.text('Hall ticket Numbers of candidates registered:', margin + 5, y);
      
      y += 8;
      
      // Calculate statistics
      const totalStudents = branchStudents.length;
      const presentStudents = branchStudents.filter(s => s.status === 'present').length;
      const absentStudents = branchStudents.filter(s => s.status === 'absent').length;
      const malpracticeStudents = branchStudents.filter(s => s.status === 'malpractice').length;
      
      // Display hall tickets in a grid
      const maxColumns = 5;
      const cellWidth = (pageWidth - 2 * margin) / maxColumns;
      const cellHeight = 7;
      let currentX = margin + 5;
      let currentY = y;
      
      // Draw hall tickets with appropriate highlighting
      branchStudents.forEach((student, index) => {
        const col = index % maxColumns;
        const row = Math.floor(index / maxColumns);
        
        currentX = margin + 5 + (col * cellWidth);
        currentY = y + (row * cellHeight);
        
        // Ensure we're not going off the page
        if (currentY > pageHeight - 50) {
          doc.addPage();
          currentY = margin;
          y = margin;
        }
        
        // Draw hall ticket number
        if (student.status === 'absent') {
          // Highlight absent students
          doc.setTextColor(255, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(student.hallTicket, currentX, currentY);
          
          // Draw box around the absent hall ticket
          doc.setDrawColor(255, 0, 0);
          const textWidth = doc.getTextWidth(student.hallTicket);
          doc.rect(currentX - 1, currentY - 5, textWidth + 2, 6);
        } else if (student.status === 'malpractice') {
          // Style for malpractice students
          doc.setTextColor(255, 128, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(student.hallTicket, currentX, currentY);
        } else {
          // Normal style for present students
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          doc.text(student.hallTicket, currentX, currentY);
        }
        
        // Reset text color for next item
        doc.setTextColor(0, 0, 0);
      });
      
      // Move to next section (summary)
      const rowsNeeded = Math.ceil(branchStudents.length / maxColumns);
      y = Math.max(y + (rowsNeeded * cellHeight) + 15, pageHeight - 45);
      
      // If we're too close to the end of the page, add a new page
      if (y > pageHeight - 45) {
        doc.addPage();
        y = margin;
      }
      
      // Create summary table at the bottom
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      
      // Define table dimensions
      const tableWidth = pageWidth - 2 * margin;
      const tableHeight = 20;
      const colWidths = [tableWidth * 0.25, tableWidth * 0.25, tableWidth * 0.25, tableWidth * 0.25];
      
      // Draw table outline
      doc.rect(margin, y, tableWidth, tableHeight);
      
      // Draw column separators
      let xPos = margin;
      for (let i = 0; i < 3; i++) {
        xPos += colWidths[i];
        doc.line(xPos, y, xPos, y + tableHeight);
      }
      
      // Draw row separator
      doc.line(margin, y + 10, margin + tableWidth, y + 10);
      
      // Add header texts
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No. of Students\nRegistered:', margin + colWidths[0]/2, y + 5, { align: 'center' });
      doc.text('No. of Students Absent:', margin + colWidths[0] + colWidths[1]/2, y + 5, { align: 'center' });
      doc.text('No. of\nMal. Practice Cases:', margin + colWidths[0] + colWidths[1] + colWidths[2]/2, y + 5, { align: 'center' });
      doc.text('No. of Students Present:', margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, y + 5, { align: 'center' });
      
      // Add values
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(totalStudents.toString(), margin + colWidths[0]/2, y + 16, { align: 'center' });
      doc.text(absentStudents.toString(), margin + colWidths[0] + colWidths[1]/2, y + 16, { align: 'center' });
      doc.text(malpracticeStudents.toString(), margin + colWidths[0] + colWidths[1] + colWidths[2]/2, y + 16, { align: 'center' });
      doc.text(presentStudents.toString(), margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]/2, y + 16, { align: 'center' });
      
      y += tableHeight + 5;
      
      // Add note about absentees
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text('* H.T. Numbers of absentees are rounded in RED ink', margin, y);
      
      y += 15;
      
      // Add signature sections
      doc.setLineWidth(0.5);
      doc.line(margin + 20, y, margin + 70, y); // Line for observer
      doc.line(pageWidth - margin - 70, y, pageWidth - margin - 20, y); // Line for chief superintendent
      
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Observer', margin + 45, y, { align: 'center' });
      doc.text('Signature of Chief Superintendent', pageWidth - margin - 45, y, { align: 'center' });
      
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVER', margin + 45, y + 5, { align: 'center' });
      doc.text('CHIEF SUPERINTENDENT', pageWidth - margin - 45, y + 5, { align: 'center' });
      
      // Add college info under chief superintendent signature
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('SRI VENKATESWARA INSTITUTE OF TECHNOLOGY', pageWidth - margin - 45, y + 10, { align: 'center' });
      doc.text('NH-7, HAMPAPURAM (V),', pageWidth - margin - 45, y + 14, { align: 'center' });
      doc.text('Paritala (M), Anantapur (Dist.)', pageWidth - margin - 45, y + 18, { align: 'center' });
      
      // Calculate file name based on branch
      const dateStr = examDetails.examDate ? new Date(examDetails.examDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const fileName = `D-Form_${branchCode}_${getBranchName(branchCode).replace(/\s+/g, '_')}_${dateStr}.pdf`;
      
      // Save the PDF
      doc.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generating branch PDF:', error);
      alert('Error generating PDF. Please try again.');
      return false;
    }
  };

  return (
    <Button 
      size="sm" 
      variant="outline-primary"
      onClick={generatePDF}
    >
      <i className="fas fa-file-pdf me-1"></i> Branch PDF
    </Button>
  );
};

export default SingleBranchPDFGenerator;