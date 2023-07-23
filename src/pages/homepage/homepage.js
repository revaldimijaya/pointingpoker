import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import './homepage.css'
import { Breadcrumb, Layout, Menu, theme, Input, Tooltip, Card, Typography, List, Avatar  } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const { Header, Content, Footer, Sider } = Layout;

const socket = io.connect('http://localhost:4000'); // Replace with your Socket.IO server URL

function Homepage() {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [master, setMaster] = useState([]);
  const [member, setMember] = useState([]);
  const [pointingValue, setPointingValue] = useState('');
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate()
  
  useEffect(() => {
    const additionalData = location.state;
    console.log(additionalData);

    if (!additionalData) {
      navigate('/');
      return
    }
    if (!additionalData.room || !additionalData.name || !additionalData.role){
      navigate('/');
      return
    }

    setRoom(additionalData.room)
    socket.emit('joinRoom', { room: additionalData.room, name: additionalData.name, value: 0, role: additionalData.role });

    socket.on('participants', (value) => {
      setParticipants(value)
    });

    const filteredListMember = participants.filter((participant) =>
      participant.role.toLowerCase().includes("member")
    );

    const filteredListMaster = participants.filter((participant) =>
      participant.role.toLowerCase().includes("master")
    );

    setMember(filteredListMember)
    setMaster(filteredListMaster)
    
    return () => {
      console.log("discconnect")
      socket.disconnect();
    };
  },[]);

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
    socket.emit('message', { id: socket.id, room: room, pointingValue: pointingValue });
  };

  const handleJoinRoom = (event) => {
    event.preventDefault();
    socket.emit('joinRoom', { room: room, name: name, value: 0 });
  };

  return (
    <Layout className="layout" style={{minHeight:'100vh'}}>
      <Sider width={200} style={{ background: colorBgContainer, padding: '0px 16px' }}>
          <Typography.Title level={3}>Game Master</Typography.Title>
              <List
                itemLayout="horizontal"
                dataSource={participants}
                renderItem={(participant) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<FontAwesomeIcon icon={faUser} />}
                      title={participant.name}
                      // Add other participant details as needed
                    />
                  </List.Item>
                )}
              />
          <Typography.Title level={3}>Participants</Typography.Title>
          <List
            itemLayout="horizontal"
            dataSource={participants}
            renderItem={(participant) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<FontAwesomeIcon icon={faUser} />}
                  title={participant.name}
                  // Add other participant details as needed
                />
              </List.Item>
            )}
          />
      </Sider>
      <Layout style={{ margin:'12px'}}>
          <Breadcrumb style={{ margin: '12px' }}>
              <Breadcrumb.Item>Session</Breadcrumb.Item>
              <Breadcrumb.Item>{room}</Breadcrumb.Item>
          </Breadcrumb>
        <Layout justify="center" align="middle" style={{maxWidth :'100%'}}>
        <div className="bucket-cards-container">
            {participants.map((val, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Card style={{
                    width: 200,
                    height: 250
                  }} 
                  title={val.name}>{val.value}
                </Card>
              </Col>
            ))}
          </div>
        </Layout>
      </Layout>
      {/* <Content
        style={{
          padding: '0 50px',
        }}
      >
        <div
          className="site-layout-content"
          style={{
            background: colorBgContainer,
          }}
        >
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
                  {participants.map((value, index) => (
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
        </div>
      </Content> */}
    </Layout>
  );
}

export default Homepage;
