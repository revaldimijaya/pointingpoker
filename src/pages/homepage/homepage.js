import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import './homepage.css'

const socket = io.connect('http://localhost:4000'); // Replace with your Socket.IO server URL

function Homepage() {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [pointingValue, setPointingValue] = useState('');

  useEffect(() => {
    socket.on('participants', (value) => {
      setParticipants(value)
    });

    return () => {
      console.log("discconnect")
      socket.disconnect();
    };
  }, []);

  const handleMessageChange = (event) => {
    setPointingValue(event.target.value);
  };

  const handleJoinRoomChange = (event) => {
    setRoom(event.target.value)
  }

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit('message', {id: socket.id, room: room, pointingValue: pointingValue});
  };

  const handleJoinRoom = (event) => {
    event.preventDefault();
    socket.emit('joinRoom', { room: room, name: name, value: 0 });
  };

  return (
    <Container className="mt-5">
      <Row>
        <h3 className="mb-3">Pointing Poker</h3>
      </Row>
      <Row>
        <div className="join-room">
          <Form onSubmit={handleJoinRoom}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="name"
                value={name}
                onChange={handleNameChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="room 1"
                value={room}
                onChange={handleJoinRoomChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Send
            </Button>
          </Form>
        </div>
      </Row>
      <br>
      </br>
      <Row>
        <h4 className="mb-3">Participants</h4>
        <Col md={6} className="offset-md-3">
          <div className="messages">
            {participants.map((value,  index) => (
              <div key={index} className="message">
                <Col>

                </Col>
                {value.id} {value.name} {value.value}
              </div>
            ))}
          </div>
        </Col>
      </Row>
      <br>
      </br>
      <Row>
        <h4 className="mb-3">Pick your poison</h4>
        <Col md={6} className="offset-md-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Control className='pointing-value'
                type="button"
                value={"1"}
                onClick={handleMessageChange}
              />
              <Form.Control className='pointing-value'
                type="button"
                value={"2"}
                onClick={handleMessageChange}
              />
              <Form.Control className='pointing-value'
                type="button"
                value={"5"}
                onClick={handleMessageChange}
              />
              <Form.Control className='pointing-value'
                type="button"
                value={"8"}
                onClick={handleMessageChange}
              />
              <Form.Control className='pointing-value'
                type="button"
                value={"12"}
                onClick={handleMessageChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Homepage;
