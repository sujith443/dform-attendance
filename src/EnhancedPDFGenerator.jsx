import React from 'react';
import { Button } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Define colors for PDF
const pdfColors = {
  primary: [78, 49, 170],      // SVIT primary color
  secondary: [44, 62, 80],     // Dark blue
  accent: [231, 76, 60],       // Red accent
  lightGray: [245, 245, 245],  // Background gray
  mediumGray: [220, 220, 220], // Border gray
  darkGray: [100, 100, 100]    // Text gray
};

// Helper function to add styled title to PDF
const addStyledTitle = (doc, text, y, fontSize = 16, color = pdfColors.primary, margin, contentWidth) => {
  doc.setFillColor(pdfColors.lightGray[0], pdfColors.lightGray[1], pdfColors.lightGray[2]);
  doc.rect(margin, y - 5, contentWidth, fontSize + 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(text, pageWidth / 2, y + fontSize/2, { align: 'center' });
  
  return y + fontSize + 10;
};

// Helper function to add section heading
const addSectionHeading = (doc, text, y, margin, contentWidth) => {
  doc.setFillColor(pdfColors.primary[0], pdfColors.primary[1], pdfColors.primary[2]);
  doc.rect(margin, y - 3, contentWidth, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(text, margin + 5, y + 2);
  
  return y + 12;
};

// Helper function to add footer
const addFooter = (doc, currentPage, totalPages) => {
  const footerY = doc.internal.pageSize.getHeight() - 20;
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setDrawColor(pdfColors.lightGray[0], pdfColors.lightGray[1], pdfColors.lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`SVIT Exam Attendance Report | Page ${currentPage} of ${totalPages}`, pageWidth / 2, footerY + 10, { align: 'center' });
};

const EnhancedPDFGenerator = ({ attendanceData, selectedRooms, stats }) => {
  const generatePDF = () => {
    try {
      // Initialize PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Page dimensions and margins
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      let currentPage = 1;
      let yPos = margin;
      
      // Create cover page
      yPos = margin;
      
      // Add title with SVIT branding
      doc.setFillColor(pdfColors.primary[0], pdfColors.primary[1], pdfColors.primary[2]);
      doc.rect(margin, yPos, contentWidth, 30, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("SVIT COLLEGE - EXAM ATTENDANCE REPORT", pageWidth / 2, yPos + 12, { align: 'center' });
      doc.setFontSize(12);
      doc.text("B.Tech Examination Management - Andhra Pradesh", pageWidth / 2, yPos + 22, { align: 'center' });
      
      yPos += 40;
      
      // Add college info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(pdfColors.secondary[0], pdfColors.secondary[1], pdfColors.secondary[2]);
      doc.text("JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY, ANANTAPUR - 515002", pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.text("EXAM CENTRE: SRI VENKATESWARA INSTITUTE OF TECHNOLOGY", pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.text("HAMPAPURAM, ANANTAPUR", pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 25;
      
      // Add date and summary
      doc.setFillColor(pdfColors.lightGray[0], pdfColors.lightGray[1], pdfColors.lightGray[2]);
      doc.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(pdfColors.primary[0], pdfColors.primary[1], pdfColors.primary[2]);
      doc.text("ATTENDANCE SUMMARY", pageWidth / 2, yPos + 12, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin + 10, yPos + 28);
      doc.text(`Total Students: ${stats.totalStudents}`, margin + 10, yPos + 40);
      doc.text(`Present: ${stats.present} (${((stats.present/stats.totalStudents) * 100).toFixed(1)}%)`, pageWidth / 2 - 15, yPos + 40);
      doc.text(`Absent: ${stats.absent} (${((stats.absent/stats.totalStudents) * 100).toFixed(1)}%)`, margin + 10, yPos + 52);
      doc.text(`Malpractice: ${stats.malpractice} (${((stats.malpractice/stats.totalStudents) * 100).toFixed(1)}%)`, pageWidth / 2 - 15, yPos + 52);
      
      yPos += 75;
      
      // Add room summary table
      yPos = addSectionHeading(doc, "ROOM WISE SUMMARY", yPos, margin, contentWidth);
      
      const tableData = selectedRooms.map(room => {
        const roomData = attendanceData[room] || {};
        const count = Object.keys(roomData).length;
        const presentCount = Object.values(roomData).filter(status => status === 'present').length;
        const absentCount = Object.values(roomData).filter(status => status === 'absent').length;
        const malpracticeCount = Object.values(roomData).filter(status => status === 'malpractice').length;
        
        return [
          room,
          count.toString(),
          presentCount.toString(),
          absentCount.toString(),
          malpracticeCount.toString()
        ];
      });
      
      doc.autoTable({
        startY: yPos,
        head: [['Room', 'Total', 'Present', 'Absent', 'Malpractice']],
        body: tableData,
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
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' },
          4: { cellWidth: 30, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: margin, right: margin }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Add footer to first page
      addFooter(doc, currentPage, selectedRooms.length + 1);
      
      // Create detailed room pages
      selectedRooms.forEach((room, index) => {
        doc.addPage();
        currentPage++;
        yPos = margin;
        
        // Add room title
        yPos = addStyledTitle(doc, `ROOM: ${room} - ATTENDANCE REPORT`, yPos, 16, pdfColors.primary, margin, contentWidth);
        
        // Add room statistics
        const roomData = attendanceData[room] || {};
        const count = Object.keys(roomData).length;
        const presentCount = Object.values(roomData).filter(status => status === 'present').length;
        const absentCount = Object.values(roomData).filter(status => status === 'absent').length;
        const malpracticeCount = Object.values(roomData).filter(status => status === 'malpractice').length;
        
        // Add stats visualization
        doc.setFillColor(pdfColors.lightGray[0], pdfColors.lightGray[1], pdfColors.lightGray[2]);
        doc.rect(margin, yPos, contentWidth, 35, 'F');
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(pdfColors.secondary[0], pdfColors.secondary[1], pdfColors.secondary[2]);
        
        doc.text(`Total Students: ${count}`, margin + 10, yPos + 10);
        
        // Present stats with green bar
        const presentWidth = (presentCount / count) * (contentWidth - 20);
        doc.text(`Present: ${presentCount} (${((presentCount/count) * 100).toFixed(1)}%)`, margin + 10, yPos + 20);
        doc.setFillColor(46, 204, 113); // Green
        doc.rect(margin + 80, yPos + 17, presentWidth, 5, 'F');
        
        // Absent stats with red bar
        const absentWidth = (absentCount / count) * (contentWidth - 20);
        doc.text(`Absent: ${absentCount} (${((absentCount/count) * 100).toFixed(1)}%)`, margin + 10, yPos + 30);
        doc.setFillColor(231, 76, 60); // Red
        doc.rect(margin + 80, yPos + 27, absentWidth, 5, 'F');
        
        yPos += 45;
        
        // Add attendance details table with colored status cells
        yPos = addSectionHeading(doc, "DETAILED ATTENDANCE", yPos, margin, contentWidth);
        
        // Prepare data for this room
        const tableData = Object.entries(roomData).map(([hallTicket, status]) => [hallTicket, status.toUpperCase()]);
        
        doc.autoTable({
          startY: yPos,
          head: [['Hall Ticket', 'Status']],
          body: tableData,
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
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40, halign: 'center' }
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
          },
          margin: { left: margin, right: margin }
        });
        
        // Add footer
        addFooter(doc, currentPage, selectedRooms.length + 1);
      });
      
      // Save the PDF
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

export default EnhancedPDFGenerator;