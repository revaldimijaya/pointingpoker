import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './homepage.css'
import { Breadcrumb, Layout, Menu, theme, Input, Tooltip, Card, Typography, List, Avatar, Button, Col, FloatButton, TextArea  } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { faUser, faEye } from '@fortawesome/free-regular-svg-icons';
import { faE } from '@fortawesome/free-solid-svg-icons';

const { Header, Content, Footer, Sider } = Layout;

const socket = io.connect('http://localhost:4000'); // Replace with your Socket.IO server URL

function Homepage() {
  const [user, setUser] = useState({});
  const [participants, setParticipants] = useState([]);
  const [pointingValue, setPointingValue] = useState('');
  const [description, setDescription] = useState('');
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

    setUser({name: additionalData.name, room: additionalData.room, role: additionalData.role})

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
    socket.emit('message', { id: socket.id, room: user.room, pointingValue: event.target.value });
  };

  const storyPoints = [
    [0.5,1,2,3,5],
    [8,13,21,34,56],
  ]

  return (
    <Layout className="layout" style={{minHeight:'100vh'}}>
      {
        user.role === "master" ? (
          <div>
            <FloatButton tooltip={<div>Jira</div>} />
          </div>
        ): (
          <></>
        )
      }
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
                <Breadcrumb.Item>{user.room}</Breadcrumb.Item>
            </Breadcrumb>
          <Layout style={{ margin: '12px 12px' }}>
          <Input.TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write some poison!"
            autoSize={{ minRows: 1, maxRows: 5 }}
          />
          </Layout>
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
          <div className='container'>
            <div className='stickyDiv'>
              { 
                user.role === "member" ? (
                  <>
                  {storyPoints.map((val) => (
                    <div >
                      {val.map((v) => (
                        <Button onClick={handleMessageChange} type="dashed" shape="square" style={{margin:"12px", width:"64px"}} value={v}>
                          {v}
                        </Button>
                      ))}
                    </div>
                  ))}
                  </>
                ) : (
                  <>
                  {
                    user.role === "master" ? (
                      <>
                      <Button style={{margin:"6px 12px", width:"100px"}} type='primary'>Show All</Button>
                      <Button style={{margin:"6px 12px", width:"100px"}} type='primary' danger>Reset</Button>
                      </>
                    ) : (
                      <>
                      <FontAwesomeIcon icon={faEye} />
                      </>
                    )
                  }
                  </>
                )
              
              }
            </div>
          </div>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Homepage;
