import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import './homepage.css'
import { Breadcrumb, Layout, Menu, theme, Input, Tooltip } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
const { Header, Content, Footer } = Layout;


const socket = io.connect('http://localhost:4000'); // Replace with your Socket.IO server URL

function Homepage() {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [pointingValue, setPointingValue] = useState('');
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
    socket.emit('message', { id: socket.id, room: room, pointingValue: pointingValue });
  };

  const handleJoinRoom = (event) => {
    event.preventDefault();
    socket.emit('joinRoom', { room: room, name: name, value: 0 });
  };

  const items1 = ['1'].map((key) => ({
    key,
    label: `Pointing`,
  }));

  return (
    <Layout className="layout">
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={items1}
        />
      </Header>
      <Content
        style={{
          padding: '0 50px',
        }}
      >
        <Breadcrumb
          style={{
            margin: '16px 0',
          }}
        >
          <Breadcrumb.Item>Pointing Poker</Breadcrumb.Item>
        </Breadcrumb>
        <div
          className="site-layout-content"
          style={{
            background: colorBgContainer,
          }}
        >
          <Input
            placeholder="Enter your username"
            prefix={<UserOutlined className="site-form-item-icon" />}
            suffix={
              <Tooltip title="Extra information">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
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
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Ant Design ©2023 Created by Ant UED
      </Footer>
    </Layout>
  );
}

export default Homepage;
