import React from 'react';
import { Button } from 'react-bootstrap';

const BeautifulPDFGenerator = ({ attendanceData, selectedRooms, stats }) => {
  // Helper function to extract branch code from hall ticket number
  const extractBranchCode = (hallTicket) => {
    // Extract branch code using slice(6,8) as specified
    if (hallTicket && typeof hallTicket === 'string' && hallTicket.length >= 8) {
      return hallTicket.slice(6, 8);
    }
    return "00"; // Default if pattern not found
  };

  // Helper function to get branch name from branch code
  const getBranchName = (branchCode) => {
    const branchNames = {
      "01": "Civil Engineering",
      "02": "Electrical & Electronics Engineering",
      "03": "Mechanical Engineering",
      "04": "Electronics & Communication",
      "05": "Computer Science",
      "12": "Information Technology",
      "42": "Artificial Intelligence",
      "66": "Data Science"
    };
    
    return branchNames[branchCode] || `Branch ${branchCode}`;
  };

  // Get lighter version of a color for backgrounds
  const getLighterColor = (color) => {
    // Mix with white to create a lighter version (80% white, 20% original)
    return [
      Math.min(255, Math.round(color[0] * 0.2 + 255 * 0.8)),
      Math.min(255, Math.round(color[1] * 0.2 + 255 * 0.8)),
      Math.min(255, Math.round(color[2] * 0.2 + 255 * 0.8))
    ];
  };

  // Get branch color for visual distinction
  const getBranchColor = (branchCode) => {
    const branchColors = {
      "01": [100, 149, 237], // Civil - Cornflower Blue
      "02": [255, 165, 0],   // EEE - Orange
      "03": [0, 128, 128],   // Mechanical - Teal
      "04": [106, 90, 205],  // ECE - Slate Blue
      "05": [60, 179, 113],  // CSE - Medium Sea Green
      "12": [220, 20, 60],   // IT - Crimson
      "42": [75, 0, 130],    // AI - Indigo
      "66": [139, 69, 19]    // DS - Saddle Brown
    };
    
    return branchColors[branchCode] || [128, 128, 128]; // Default gray
  };

  // Log branch information for debugging
  const logBranchInfo = (attendanceData) => {
    // Loop through each room
    for (const [room, students] of Object.entries(attendanceData)) {
      console.log(`Seating arrangement for ${room}:`);
      // Loop through students in the room
      for (const [hallTicket, status] of Object.entries(students)) {
        const branchCode = hallTicket.slice(6, 8);
        console.log(`  ${hallTicket}: Branch ${branchCode} - ${getBranchName(branchCode)}, Status: ${status}`);
      }
    }
  };

  const generatePDF = async () => {
    try {
      // Log branch info for debugging
      logBranchInfo(attendanceData);

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
      
      // Collect all students by branch (across all rooms)
      const allBranchStudents = {};
      
      // Process all rooms and organize students by branch
      selectedRooms.forEach(room => {
        const roomData = attendanceData[room] || {};
        
        Object.entries(roomData).forEach(([hallTicket, status]) => {
          const branchCode = extractBranchCode(hallTicket);
          
          // Initialize branch if not exists
          if (!allBranchStudents[branchCode]) {
            allBranchStudents[branchCode] = {
              present: [],
              absent: [],
              malpractice: []
            };
          }
          
          // Add student to appropriate status list
          if (status === 'present') {
            allBranchStudents[branchCode].present.push(hallTicket);
          } else if (status === 'absent') {
            allBranchStudents[branchCode].absent.push(hallTicket);
          } else if (status === 'malpractice') {
            allBranchStudents[branchCode].malpractice.push(hallTicket);
          }
        });
      });
      
      // Add branch summary section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(78, 49, 170);
      doc.text('BRANCH DISTRIBUTION', pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      
      // Calculate branch statistics
      const branchStats = {};
      Object.entries(allBranchStudents).forEach(([branchCode, students]) => {
        const present = students.present.length;
        const absent = students.absent.length;
        const malpractice = students.malpractice.length;
        const total = present + absent + malpractice;
        
        if (total > 0) {
          branchStats[branchCode] = { present, absent, malpractice, total };
        }
      });
      
      // Create branch statistics table
      if (Object.keys(branchStats).length > 0) {
        // Table header
        const headerCells = ["Branch", "Total", "Present", "Absent", "Malpractice", "%"];
        const colWidths = [70, 25, 25, 25, 25, 15];
        
        // Draw header
        doc.setFillColor(78, 49, 170);
        let xPos = margin;
        headerCells.forEach((header, i) => {
          doc.rect(xPos, y, colWidths[i], 10, 'F');
          xPos += colWidths[i];
        });
        
        // Draw header text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        
        xPos = margin;
        headerCells.forEach((header, i) => {
          doc.text(header, xPos + colWidths[i]/2, y + 6, { align: 'center' });
          xPos += colWidths[i];
        });
        
        y += 10;
        
        // Draw data rows
        Object.entries(branchStats)
          .sort((a, b) => b[1].total - a[1].total) // Sort by total count
          .forEach(([branchCode, data], rowIndex) => {
            // Check if we need a new page
            if (y + 10 > pageHeight - margin) {
              doc.addPage();
              y = 20;
              
              // Redraw header
              doc.setFillColor(78, 49, 170);
              let xPos = margin;
              headerCells.forEach((header, i) => {
                doc.rect(xPos, y, colWidths[i], 10, 'F');
                xPos += colWidths[i];
              });
              
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(9);
              doc.setTextColor(255, 255, 255);
              
              xPos = margin;
              headerCells.forEach((header, i) => {
                doc.text(header, xPos + colWidths[i]/2, y + 6, { align: 'center' });
                xPos += colWidths[i];
              });
              
              y += 10;
            }
            
            // Alternate row colors
            if (rowIndex % 2 === 0) {
              doc.setFillColor(240, 240, 240);
            } else {
              doc.setFillColor(255, 255, 255);
            }
            
            // Draw row background
            xPos = margin;
            let totalWidth = 0;
            colWidths.forEach(width => {
              totalWidth += width;
            });
            doc.rect(margin, y, totalWidth, 8, 'F');
            
            // Draw row data
            const branchName = getBranchName(branchCode);
            const percentage = Math.round((data.total / stats.totalStudents) * 100);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(60, 60, 60);
            
            // Branch name
            doc.text(`${branchName} (${branchCode})`, margin + 3, y + 5, { align: 'left' });
            
            // Statistics
            xPos = margin + colWidths[0];
            doc.text(data.total.toString(), xPos + colWidths[1]/2, y + 5, { align: 'center' });
            xPos += colWidths[1];
            
            doc.text(data.present.toString(), xPos + colWidths[2]/2, y + 5, { align: 'center' });
            xPos += colWidths[2];
            
            doc.text(data.absent.toString(), xPos + colWidths[3]/2, y + 5, { align: 'center' });
            xPos += colWidths[3];
            
            doc.text(data.malpractice.toString(), xPos + colWidths[4]/2, y + 5, { align: 'center' });
            xPos += colWidths[4];
            
            doc.text(`${percentage}%`, xPos + colWidths[5]/2, y + 5, { align: 'center' });
            
            y += 8;
          });
      }
      
      y += 10;
      
      // Create a new page for each branch
      const branchCodes = Object.keys(allBranchStudents).sort(); // Sort by branch code
      
      branchCodes.forEach(branchCode => {
        const branchData = allBranchStudents[branchCode];
        const totalStudents = branchData.present.length + branchData.absent.length + branchData.malpractice.length;
        
        // Skip empty branches
        if (totalStudents === 0) return;
        
        // Start a new page for each branch
        doc.addPage();
        y = 20;
        
        // Get branch info
        const branchName = getBranchName(branchCode);
        const branchColor = getBranchColor(branchCode);
        const branchLightColor = getLighterColor(branchColor);
        
        // Add branch header
        doc.setFillColor(branchLightColor[0], branchLightColor[1], branchLightColor[2]);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 3, 3, 'F');
        
        doc.setDrawColor(branchColor[0], branchColor[1], branchColor[2]);
        doc.setLineWidth(1);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 3, 3, 'S');
        
        // Add branch name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(branchColor[0], branchColor[1], branchColor[2]);
        doc.text(`${branchName} (${branchCode})`, pageWidth / 2, y + 10, { align: 'center' });
        
        // Add stats
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Total: ${totalStudents} | Present: ${branchData.present.length} | Absent: ${branchData.absent.length} | Malpractice: ${branchData.malpractice.length}`, 
          pageWidth / 2, y + 20, { align: 'center' });
        
        y += 35;
        
        // Show students by attendance status
        const sections = [
          { 
            title: "PRESENT STUDENTS", 
            students: branchData.present.sort(), 
            color: [46, 184, 46],
            textColor: [255, 255, 255],
            fontStyle: 'normal'
          },
          { 
            title: "ABSENT STUDENTS", 
            students: branchData.absent.sort(), 
            color: [220, 53, 69],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          { 
            title: "MALPRACTICE STUDENTS", 
            students: branchData.malpractice.sort(), 
            color: [255, 153, 0],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          }
        ];
        
        // Only display sections with students
        sections.filter(section => section.students.length > 0).forEach(section => {
          // Check if we need a new page
          if (y + 30 > pageHeight - margin) {
            doc.addPage();
            y = 20;
          }
          
          // Add section header
          doc.setFillColor(section.color[0], section.color[1], section.color[2]);
          doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(section.textColor[0], section.textColor[1], section.textColor[2]);
          doc.text(`${section.title} (${section.students.length})`, margin + 10, y + 7);
          
          y += 15;
          
          // Create a grid for hall tickets
          const gridColumns = 5;
          const cellWidth = (pageWidth - 2 * margin) / gridColumns;
          const cellHeight = 10;
          
          // Draw students in grid
          let gridY = y;
          section.students.forEach((hallTicket, index) => {
            const row = Math.floor(index / gridColumns);
            const col = index % gridColumns;
            
            // Check if we need a new page
            if (gridY + (row * cellHeight) + cellHeight > pageHeight - margin) {
              doc.addPage();
              gridY = 20;
              
              // Add continuation header
              doc.setFillColor(section.color[0], section.color[1], section.color[2]);
              doc.rect(margin, gridY, pageWidth - 2 * margin, 10, 'F');
              
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(10);
              doc.setTextColor(section.textColor[0], section.textColor[1], section.textColor[2]);
              doc.text(`${section.title} (Continued)`, margin + 10, gridY + 7);
              
              gridY += 15;
            }
            
            // Calculate cell position
            const x = margin + (col * cellWidth);
            const cellY = gridY + (Math.floor((index % (gridColumns * Math.floor((pageHeight - gridY - margin) / cellHeight)))) / gridColumns) * cellHeight;
            
            // Alternate background colors
            if ((row + col) % 2 === 0) {
              doc.setFillColor(240, 240, 240);
            } else {
              doc.setFillColor(250, 250, 250);
            }
            
            // Draw cell
            doc.rect(x, cellY, cellWidth, cellHeight, 'F');
            
            // Draw hall ticket
            doc.setFont('helvetica', section.fontStyle);
            doc.setFontSize(8);
            doc.setTextColor(60, 60, 60);
            doc.text(hallTicket, x + cellWidth/2, cellY + cellHeight/2, { align: 'center', baseline: 'middle' });
          });
          
          // Calculate new y position
          const rowsCount = Math.ceil(section.students.length / gridColumns);
          y = gridY + (rowsCount * cellHeight) + 10;
        });
      });
      
      // Add footer on each page
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
      
      // Save the PDF with a descriptive filename including date
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      doc.save(`SVIT_Exam_Attendance_Report_${dateStr}.pdf`);
      
      console.log('PDF generation completed successfully.');
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Error generating PDF: ${error.message}. Please try again or check your browser's console for details.`);
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