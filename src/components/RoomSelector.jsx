import React from 'react';
import { Form, ButtonGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const RoomSelector = ({ rooms, selectedRoom, onRoomChange, roomDetails }) => {
  return (
    <div>
      <Form.Group>
        <Form.Label>Select Room</Form.Label>
        <Form.Select 
          value={selectedRoom}
          onChange={(e) => onRoomChange(e.target.value)}
        >
          {rooms.map(room => {
            const studentCount = roomDetails?.[room]?.totalStudents || 0;
            return (
              <option key={room} value={room}>
                {room} ({studentCount} students)
              </option>
            );
          })}
        </Form.Select>
      </Form.Group>
      
      {/* Display room navigation if more than one room */}
      {rooms.length > 1 && (
        <div className="mt-2">
          <ButtonGroup size="sm">
            <Button
              variant="outline-primary"
              onClick={() => {
                const currentIndex = rooms.indexOf(selectedRoom);
                if (currentIndex > 0) {
                  onRoomChange(rooms[currentIndex - 1]);
                }
              }}
              disabled={rooms.indexOf(selectedRoom) === 0}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="me-1" />
              Previous Room
            </Button>
            
            <Button
              variant="outline-primary"
              onClick={() => {
                const currentIndex = rooms.indexOf(selectedRoom);
                if (currentIndex < rooms.length - 1) {
                  onRoomChange(rooms[currentIndex + 1]);
                }
              }}
              disabled={rooms.indexOf(selectedRoom) === rooms.length - 1}
            >
              Next Room
              <FontAwesomeIcon icon={faChevronRight} className="ms-1" />
            </Button>
          </ButtonGroup>
        </div>
      )}
    </div>
  );
};

export default RoomSelector;