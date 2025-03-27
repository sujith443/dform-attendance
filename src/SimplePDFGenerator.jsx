import React from 'react';
import { Button } from 'react-bootstrap';

const SimplePDFGenerator = ({ attendanceData, selectedRooms, stats }) => {
  const generatePDF = () => {
    try {
      // Import jsPDF dynamically to ensure it loads properly
      import('jspdf').then(({ jsPDF }) => {
        // Now import autoTable
        import('jspdf-autotable').then(() => {
          // Create new document
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(18);
          doc.text('SVIT College - Exam Attendance Report', 105, 15, { align: 'center' });
          
          // Add date
          doc.setFontSize(12);
          doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
          
          // Add summary stats
          doc.setFontSize(14);
          doc.text('Attendance Summary:', 15, 35);
          
          // Summary table
          const summaryData = [
            ['Total Students', 'Present', 'Absent', 'Malpractice'],
            [
              stats.totalStudents.toString(),
              stats.present.toString(),
              stats.absent.toString(),
              stats.malpractice.toString()
            ]
          ];
          
          doc.autoTable({
            startY: 40,
            head: [summaryData[0]],
            body: [summaryData[1]],
            theme: 'grid',
            headStyles: { fillColor: [78, 49, 170] },
            margin: { top: 40 }
          });
          
          let yPosition = doc.lastAutoTable.finalY + 20;
          
          // Process each room
          selectedRooms.forEach((room, roomIndex) => {
            // Check if need new page
            if (yPosition > 220) {
              doc.addPage();
              yPosition = 20;
            }
            
            // Add room header
            doc.setFontSize(14);
            doc.text(`Room: ${room}`, 15, yPosition);
            
            // Extract room data
            const roomData = attendanceData[room] || {};
            
            // Prepare data for tables by attendance status
            const presentStudents = [];
            const absentStudents = [];
            const malpracticeStudents = [];
            
            Object.entries(roomData).forEach(([hallTicket, status]) => {
              if (status === 'present') {
                presentStudents.push([hallTicket]);
              } else if (status === 'absent') {
                absentStudents.push([hallTicket]);
              } else if (status === 'malpractice') {
                malpracticeStudents.push([hallTicket]);
              }
            });
            
            // Create attendance tables by status
            yPosition += 10;
            
            // Present students table
            if (presentStudents.length > 0) {
              doc.autoTable({
                startY: yPosition,
                head: [['Present Students']],
                body: presentStudents,
                theme: 'grid',
                headStyles: { fillColor: [46, 184, 46] },
                margin: { left: 15, right: 110 }
              });
              
              yPosition = doc.lastAutoTable.finalY + 10;
            }
            
            // Check if need new page for absent
            if (yPosition > 220) {
              doc.addPage();
              yPosition = 20;
            }
            
            // Absent students table
            if (absentStudents.length > 0) {
              doc.autoTable({
                startY: yPosition,
                head: [['Absent Students']],
                body: absentStudents,
                theme: 'grid',
                headStyles: { fillColor: [220, 53, 69] },
                margin: { left: 15, right: 110 }
              });
              
              yPosition = doc.lastAutoTable.finalY + 10;
            }
            
            // Check if need new page for malpractice
            if (yPosition > 220) {
              doc.addPage();
              yPosition = 20;
            }
            
            // Malpractice students table
            if (malpracticeStudents.length > 0) {
              doc.autoTable({
                startY: yPosition,
                head: [['Malpractice Students']],
                body: malpracticeStudents,
                theme: 'grid',
                headStyles: { fillColor: [255, 193, 7] },
                margin: { left: 15, right: 110 }
              });
              
              yPosition = doc.lastAutoTable.finalY + 20;
            }
            
            // Add some space between rooms
            yPosition += 10;
          });
          
          // Save the PDF
          doc.save('SVIT_Exam_Attendance_Report.pdf');
        });
      });
      
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please check console for details.');
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

export default SimplePDFGenerator;