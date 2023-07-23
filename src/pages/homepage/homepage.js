import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './homepage.css'
import { Breadcrumb, Layout, Menu, theme, Input, Tooltip, Card, Typography, List, Avatar, Button, Col  } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { faUser } from '@fortawesome/free-regular-svg-icons';

const { Header, Content, Footer, Sider } = Layout;

const socket = io.connect('http://localhost:4000'); // Replace with your Socket.IO server URL

function Homepage() {
  const [room, setRoom] = useState('');
  const [participants, setParticipants] = useState([]);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit('message', { id: socket.id, room: room, pointingValue: pointingValue });
  };

  const storyPoints = [
    [1,2,3],
    [5,8,13],
    [20,40,100]
  ]

  return (
    <Layout className="layout" style={{minHeight:'100vh'}}>
      <Sider width={200} style={{ background: colorBgContainer, padding: '0px 16px' }}>
          <Typography.Title level={4}>Game Master</Typography.Title>
          <List
            itemLayout="horizontal"
            dataSource={participants.filter((participant) =>participant.role.toLowerCase().includes("master"))}
            renderItem={(participant) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<FontAwesomeIcon icon={faUser} />}
                  title={participant.name}
                
                />
              </List.Item>
            )}
          />
          <Typography.Title level={4}>Members</Typography.Title>
          <List
            itemLayout="horizontal"
            dataSource={participants.filter((participant) =>participant.role.toLowerCase().includes("member"))}
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
          <Typography.Title level={4}>Observer</Typography.Title>
          <List
            itemLayout="horizontal"
            dataSource={participants.filter((participant) =>participant.role.toLowerCase().includes("observer"))}
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
        <Layout>
            <Breadcrumb style={{ margin: '12px 12px' }}>
                <Breadcrumb.Item>Session</Breadcrumb.Item>
                <Breadcrumb.Item>{room}</Breadcrumb.Item>
            </Breadcrumb>
          <Layout justify="center" align="middle" style={{minHeight:'70vh'}}>
          <div className="bucket-cards-container">
              {participants.map((val, index) => (
                <Col key={index}>
                  <Card style={{
                      width: 200,
                      height: 240,
                      margin: "0 12px"
                    }} 
                    title={val.name}>{val.value}
                  </Card>
                </Col>
              ))}
            </div>
          </Layout>
        </Layout>
        <Layout style={{ margin:'0 12px'}}>
          <Content style={{
            padding: 24,
            background: colorBgContainer,
          }}>
            {storyPoints.map((val) => (
              <div>
                {val.map((v) => (
                  <Button type="dashed" shape="square" style={{margin:"12px", width:"64px"}} value={v}>
                    {v}
                  </Button>
                ))}
              </div>
            ))}
          </Content>
        </Layout>
      </Layout>
      {/* <Content
        style={{
          padding: '0 40px',
        }}
      >
        <div
          className="site-layout-content"
          style={{
            background: colorBgContainer,
          }}
        >
          <Container className="mt-4">
            <Row>
              <h4 className="mb-4">Pointing Poker</h4>
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
              <h4 className="mb-4">Participants</h4>
              <Col md={6} className="offset-md-4">
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
              <h4 className="mb-4">Pick your poison</h4>
              <Col md={6} className="offset-md-4">
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
                      value={"4"}
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
