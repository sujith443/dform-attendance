// This utility extracts student data from the uploaded PDF file
// In a real application, we would use a PDF parsing library like pdf.js

export const extractStudentsFromPDF = async (pdfFile) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            // Get PDF content as a string
            const pdfContent = e.target.result;
            
            // Process the PDF content to extract data
            const extractedData = await processPDFContent(pdfContent);
            
            if (extractedData.students.length === 0) {
              reject(new Error('No hall tickets found in the PDF. Make sure you uploaded the correct seating plan.'));
              return;
            }
            
            resolve(extractedData);
          } catch (err) {
            console.error("Error processing PDF:", err);
            reject(err);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read the PDF file'));
        };
        
        // Read the file as text (for textual PDF content)
        reader.readAsText(pdfFile);
      } catch (err) {
        reject(err);
      }
    });
  };
  
  // Process the PDF content and extract all necessary information
  const processPDFContent = async (pdfContent) => {
    // Extract exam details
    const examTitle = extractExamTitle(pdfContent);
    const examDate = extractExamDate(pdfContent);
    const examCenter = extractExamCenter(pdfContent);
    
    // Extract rooms and students
    const roomsData = extractRooms(pdfContent);
    const studentsData = extractStudents(pdfContent);
    
    return {
      examInfo: {
        title: examTitle,
        date: examDate,
        center: examCenter
      },
      rooms: roomsData.rooms,
      roomDetails: roomsData.roomDetails,
      students: studentsData,
      summary: calculateSummary(studentsData)
    };
  };
  
  // Extract the exam title from the PDF content
  const extractExamTitle = (pdfContent) => {
    const titleMatch = pdfContent.match(/B\.Tech.*Exams/);
    return titleMatch ? titleMatch[0] : 'Examination';
  };
  
  // Extract the exam date from the PDF content
  const extractExamDate = (pdfContent) => {
    const dateMatch = pdfContent.match(/Generated on: ([^,]+)/);
    return dateMatch ? dateMatch[1] : new Date().toLocaleDateString();
  };
  
  // Extract the exam center details
  const extractExamCenter = (pdfContent) => {
    const centerMatch = pdfContent.match(/EXAM CENTRE:\s*([^\n]+)/);
    return centerMatch ? centerMatch[1] : 'SVIT';
  };
  
  // Extract all rooms from the PDF content
  const extractRooms = (pdfContent) => {
    // Find all room references
    const roomPattern = /ROOM: Room (\d+)/g;
    const rooms = [];
    const roomDetails = {};
    
    // Extract room numbers
    let roomMatch;
    while ((roomMatch = roomPattern.exec(pdfContent)) !== null) {
      const roomNumber = roomMatch[1];
      const roomName = `Room ${roomNumber}`;
      
      if (!rooms.includes(roomName)) {
        rooms.push(roomName);
        
        // Try to extract room details like total students
        const roomDetailPattern = new RegExp(`ROOM: ${roomName}[\\s\\S]+?Total Students: (\\d+)`);
        const detailMatch = pdfContent.match(roomDetailPattern);
        
        roomDetails[roomName] = {
          totalStudents: detailMatch ? parseInt(detailMatch[1]) : 0,
          configuration: extractRoomConfiguration(pdfContent, roomName)
        };
      }
    }
    
    return { rooms, roomDetails };
  };
  
  // Extract room configuration (rows x columns)
  const extractRoomConfiguration = (pdfContent, roomName) => {
    const configPattern = new RegExp(`${roomName}[\\s\\S]+?Room Configuration: (\\d+) Rows × (\\d+) Columns`);
    const configMatch = pdfContent.match(configPattern);
    
    if (configMatch) {
      return {
        rows: parseInt(configMatch[1]),
        columns: parseInt(configMatch[2])
      };
    }
    
    return { rows: 0, columns: 0 };
  };
  
  // Extract all students from the PDF content
  const extractStudents = (pdfContent) => {
    const students = [];
    const hallTicketPattern = /\b\d{3}[A-Za-z0-9]{7}\b/g;
    const linePattern = /(\d{3}[A-Za-z0-9]{7})\s+(DESK - \d+ COLUMN - \d+)\s+([A-Za-z]+-?\d*)/g;
    
    // Extract all hall tickets with seating and branch info
    let lineMatch;
    while ((lineMatch = linePattern.exec(pdfContent)) !== null) {
      const hallTicket = lineMatch[1];
      const seating = lineMatch[2];
      const branch = lineMatch[3];
      
      // Determine which room this belongs to
      const beforeHallTicket = pdfContent.substring(0, lineMatch.index);
      const lastRoomMatch = [...beforeHallTicket.matchAll(/ROOM: Room (\d+)/g)].pop();
      
      if (lastRoomMatch) {
        const room = `Room ${lastRoomMatch[1]}`;
        
        // Extract row and column from seating
        const seatMatch = seating.match(/DESK - (\d+) COLUMN - (\d+)/);
        const row = seatMatch ? parseInt(seatMatch[1]) : 0;
        const column = seatMatch ? parseInt(seatMatch[2]) : 0;
        
        // Check for duplicate (shouldn't happen, but just in case)
        const existingIndex = students.findIndex(s => s.hallTicket === hallTicket);
        if (existingIndex === -1) {
          students.push({
            hallTicket,
            room,
            seating,
            row,
            column,
            branch,
            status: "Not Marked"
          });
        }
      }
    }
    
    // Sort students by room, then row, then column
    students.sort((a, b) => {
      if (a.room !== b.room) return a.room.localeCompare(b.room);
      if (a.row !== b.row) return a.row - b.row;
      return a.column - b.column;
    });
    
    return students;
  };
  
  // Calculate summary statistics
  const calculateSummary = (students) => {
    const branchCounts = {};
    const roomCounts = {};
    
    students.forEach(student => {
      // Count by branch
      branchCounts[student.branch] = (branchCounts[student.branch] || 0) + 1;
      
      // Count by room
      roomCounts[student.room] = (roomCounts[student.room] || 0) + 1;
    });
    
    return {
      totalStudents: students.length,
      branchCounts,
      roomCounts
    };
  };