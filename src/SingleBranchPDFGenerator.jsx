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
      
      // Add top wavy line styling (simulate the wavy header)
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      for (let i = 0; i < pageWidth; i += 5) {
        doc.line(i, 8, i + 2.5, 6);
        doc.line(i + 2.5, 6, i + 5, 8);
      }
      
      // Add header content
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Jawaharlal Nehru Technological University, Anantapur – 515 002', pageWidth / 2, y, { align: 'center' });
      
      y += 10;
      
      // Draw a thin line underneath the university name
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
      
      // Add SVIT College name in bold with all caps
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('SRI VENKATESWARA INSTITUTE OF TECHNOLOGY', pageWidth / 2, y, { align: 'center' });
      
      y += 6;
      
      // Add location in all caps
      doc.setFontSize(9);
      doc.text('HAMPAPURAM - ANANTAPUR', pageWidth / 2, y, { align: 'center' });
      
      y += 10;
      
      // Add D-Form heading and create border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      
      // Add D-FORM text centered
      doc.setFontSize(11);
      doc.text('D - FORM', pageWidth / 2, y, { align: 'center' });
      
      // Draw horizontal line below D-FORM
      y += 5;
      doc.setLineWidth(0.2);
      doc.line(margin + 50, y, pageWidth - margin - 50, y);
      
      y += 10;
      
      // Add branch information with proper styling
      const branchName = getBranchName(branchCode);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`BRANCH: ${branchName}`, margin + 5, y);
      
      // Add branch code on right side
      doc.text(`BRANCH CODE: ${branchCode}`, pageWidth - margin - 25, y, { align: 'right' });
      
      y += 10;
      
      // Add exam name with proper styling as in the image
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`NAME OF THE EXAMINATION :: ${examDetails.examName || 'IV - B.Tech - I Sem - Regular & Supple Exams'} - ${examDetails.regulation || 'DEC/JAN - 2024'}`, margin + 5, y);
      
      y += 8;
      
      // Add subject details exactly as in image
      doc.text(`NAME OF THE SUBJECT & SUBJECT CODE :: ${examDetails.subjectName || '_______'} - ${examDetails.subjectCode || '_______'}`, margin + 5, y);
      
      // Add regulation on the right as in image
      doc.text(`Regulation : ${examDetails.regulation || 'R20'}`, pageWidth - margin - 25, y, { align: 'right' });
      
      y += 8;
      
      // Add date with proper spacing and format
      const examDate = examDetails.examDate ? new Date(examDetails.examDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/') : '16/12/2024';
      
      doc.text(`DATE OF THE EXAMINATION :: ${examDate}`, margin + 5, y);
      
      // Add session on the right as in image
      doc.text(`SESSION : FN`, pageWidth - margin - 25, y, { align: 'right' });
      
      y += 10;
      
      // Draw a horizontal separator line as in the image
      doc.setLineWidth(0.3);
      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, pageWidth - margin, y);
      
      // Small gap after line
      y += 5;
      
      // Add hall ticket list heading with proper styling
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Hall ticket Numbers of candidates registered:', margin + 5, y);
      
      y += 10; // Space before hall tickets
      
      // Calculate statistics
      const totalStudents = branchStudents.length;
      const presentStudents = branchStudents.filter(s => s.status === 'present').length;
      const absentStudents = branchStudents.filter(s => s.status === 'absent').length;
      const malpracticeStudents = branchStudents.filter(s => s.status === 'malpractice').length;
      
      // Display hall tickets in a grid like the image
      const maxColumns = 5;
      const cellWidth = (pageWidth - 2 * margin) / maxColumns;
      const cellHeight = 8; // Better spacing matching the image
      let currentX = margin + 5;
      let currentY = y;
      
      // Reset text color for hall tickets
      doc.setTextColor(0, 0, 0);
      
      // Draw hall tickets with appropriate highlighting - matching image style
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
        
        // Draw hall ticket number with a slash after it (as in the image)
        if (student.status === 'absent') {
          // Highlight absent students with box (as in the image)
          doc.setTextColor(0, 0, 0); // Use black text
          doc.setFont('helvetica', 'normal');
          
          // Draw the ticket number first
          doc.text(student.hallTicket, currentX, currentY);
          
          // Then draw the box around it (as in the image)
          const textWidth = doc.getTextWidth(student.hallTicket);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(currentX - 1, currentY - 5, textWidth + 2, 6);
          
          // Add a little slash after
          doc.text("/", currentX + textWidth + 3, currentY);
        } else if (student.status === 'malpractice') {
          // Style for malpractice students
          doc.setTextColor(0, 0, 0); // Use black text
          doc.setFont('helvetica', 'bolditalic');
          doc.text(student.hallTicket, currentX, currentY);
          
          // Add a little slash after (as in the image)
          doc.text("/", currentX + doc.getTextWidth(student.hallTicket) + 3, currentY);
        } else {
          // Normal style for present students
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          doc.text(student.hallTicket, currentX, currentY);
          
          // Add a little slash after (as in the image)
          doc.text("/", currentX + doc.getTextWidth(student.hallTicket) + 3, currentY);
        }
        
        // Reset text color for next item
        doc.setTextColor(0, 0, 0);
      });
      
      // Move to next section - leave about 60% of the page for hall tickets as in the image
      const rowsNeeded = Math.ceil(branchStudents.length / maxColumns);
      const hallTicketsHeight = (rowsNeeded * cellHeight) + 10;
      const remainingSpace = pageHeight - y - hallTicketsHeight;
      
      // If hall tickets exceed about 60% of page or are close to the end, add a new page
      if (y + hallTicketsHeight > pageHeight - 80 || remainingSpace < 80) {
        doc.addPage();
        y = 30; // Start lower on the new page for the summary table
      } else {
        // Otherwise, position the summary table with proper spacing
        y = pageHeight - 75; // Fixed position at the bottom of page as in the image
      }
      
      // Create summary table at the bottom - exactly as in the image
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
      
      // Add values with larger font and bold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12); // Increased from 11 to 12
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
      
      // Add bold OBSERVER heading under signature
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVER', margin + 45, y + 5, { align: 'center' });
      
      // Add CHIEF SUPERINTENDENT and college info in multiple lines as in the image
      doc.text('CHIEF SUPERINTENDENT', pageWidth - margin - 45, y + 5, { align: 'center' });
      
      // Add college info under chief superintendent signature
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7); // Smaller text for college info as in the image
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