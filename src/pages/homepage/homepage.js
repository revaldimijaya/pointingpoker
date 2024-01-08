import React, { Children, useEffect, useState } from 'react';
import io from 'socket.io-client';
import './homepage.css'
import { Breadcrumb, Layout, Menu, theme, Input, Tooltip, Card, Typography, List, Avatar, Button, Col, FloatButton, TextArea, Descriptions, Modal  } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { faUser, faEye, faCopy, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faE } from '@fortawesome/free-solid-svg-icons';
import Ticket from '../ticket/ticket';

const { Header, Content, Footer, Sider } = Layout;

const socket = io.connect('https://revaldi-pointing-poker-server-c29b9ec1de13.herokuapp.com/'); // Replace with your Socket.IO server URL

function Homepage({keyProp}) {
  const [user, setUser] = useState({});
  const [participants, setParticipants] = useState([]);
  const [description, setDescription] = useState('');
  const [showValue, setShowValue] = useState()
  const [ticket, setTicket] = useState({})
  const [calculate, setCalculate]= useState({})

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate()
  
  useEffect(() => {
    const additionalData = location.state;
    console.log("Additional Data : ", additionalData)
    if (!additionalData) {
      navigate('/');
      return
    }
    if (!additionalData.room || !additionalData.name || !additionalData.role){
      navigate('/');
      return
    }

    setUser({name: additionalData.name, room: additionalData.room, role: additionalData.role})

    // // Emit a custom event to check if a given socket ID is the server's socket
    // socket.emit('checkServerSocket', socket.id);
    // halo

    // // Listen for the result from the server
    // socket.on('isServerSocket', (isServerSocket) => {
    //   console.log(`Is server socket: ${isServerSocket}`);
    // });

    socket.emit('joinRoom', { room: additionalData.room, name: additionalData.name, value: 0, role: additionalData.role });

    socket.on('participants', (value) => {
      setParticipants(value)
    });
    
    socket.on('showAll', (payload) => {
      // console.log("show all")
      setShowValue(true)
    })

    socket.on('reset', (payload) => {
      // console.log("reset")
      setShowValue(false)
    })

    socket.on('ticket', (payload) => {
      setTicket(payload)
    })

    socket.on('description', (payload) => {
      console.log("description ", payload)
      setDescription(payload.value)
    })

    socket.on('calculate', (payload) => {
      console.log('calculate', payload)
      setCalculate(payload)
    })
    return () => {
      console.log("discconnect")
      socket.disconnect();
    };
  },[location.state, navigate]);

  const handleMessageChange = (event) => {
    socket.emit('message', { id: socket.id, room: user.room, pointingValue: event.target.value });
  };

  const handleResetChange = (room) => {
    socket.emit('reset', {value: false, room: user.room} )
    socket.emit('calculate', {SP: 0, task: ''.task ,room: user.room})
  }

  const handleShowAllChange = (payload) => {
    socket.emit('showAll', {value: true, room: user.room} )
    console.log(sumValues)
    socket.emit('calculate', {SP: taskAndSP.SP, task: taskAndSP.task ,room: user.room})
  }

  const handleDescriptionEnter = (event) => {
    console.log("Key press ", event)
    socket.emit('description',{value: description, room: user.room})
  }

  const [clicked, setClicked] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText("https://revaldimijaya.my.id/"+user.room);
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 200); // Reset animation after 1 second
  }

  const storyPoints = [
    [1,2,3,5],
    [8,13,21,34],
  ]

  const summaryDescription = [
    {
      key: '1',
      label: 'Task',
      Children: '[PTP]',
    },
    {
      key: '2',
      label: 'Total SP',
      Children: '22',
    },
  ]

  const memberParticipants =  participants.filter((participant) => participant.role === 'member');

  const sumValues = memberParticipants.reduce((acc, participant) => acc + parseInt(participant.value), 0);
  const totalParticipants = memberParticipants.length;
  const averageValue = totalParticipants > 0 ? sumValues / totalParticipants : 0;

  const taskAndSP = {
    task: description,
    SP: averageValue
  }

  // -------------------  MODAL ----------------------------------------
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Content of the modal');
  const showModal = () => {
    setOpen(true);
  };
  const handleOk = () => {
    setModalText('The modal will be closed after two seconds');
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };
  const handleCancel = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };

  // ------------------- MODAL ----------------------------------------

  return (
    <Layout className="layout" style={{minHeight:'100vh'}}>
      <Modal
        title="Jira Ticket"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Ticket param={{description: description, totalSP: averageValue}}/>
      </Modal>
      {
        user.role === "master" ? (
          <div>
            <FloatButton onClick={showModal} tooltip={<div>Jira</div>} />
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
                  title={participant.name.split('#')[0]}
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
                  title={participant.name.split('#')[0]}
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
                  title={participant.name.split('#')[0]}
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
                <Breadcrumb.Item><span style={{marginRight:'8px'}}>{user.room}</span><FontAwesomeIcon className={`icon ${clicked ? 'clicked' : ''}`} icon={faCopy} onClick={handleCopy} /></Breadcrumb.Item>
            </Breadcrumb>
          <Layout style={{ margin: '12px 12px' }}>
            <Input.TextArea
              value={description}
              onPressEnter={handleDescriptionEnter}
              onChange={(e)=> setDescription(e.target.value)}
              placeholder="Task description please enter to notify all"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Layout>
          <Layout style={{ margin: '12px 12px' }}>
            <Descriptions title="Summary">
              <Descriptions.Item labelStyle={{fontSize:'17px'}} label="Task"><span style={{fontSize:'17px'}}>{calculate.task}</span></Descriptions.Item>
              <Descriptions.Item labelStyle={{fontSize:'17px'}} label="Total SP"><span style={{fontSize:'17px'}}>{calculate.SP == 0 ? '': calculate.SP}</span></Descriptions.Item>
            </Descriptions>
          </Layout>
          <Layout justify="center" align="middle" style={{minHeight:'70vh'}}>
          <div className="bucket-cards-container">
              { memberParticipants.map((val, index) => (
                <Col key={index}>
                  <Card style={{
                      width: 200,
                      margin: "0 12px 32px 12px"  
                    }} 
                    title={val.name === user.name ? val.name.split('#')[0] + ' (you)': val.name.split('#')[0]}>
                      <div style={{margin:"24px 0px"}}>
                        <span style={{fontSize:'48px',}}>
                          {
                            val.name === user.name ? (
                              <>
                                <div style={{color:"#97BC62FF"}}>{val.value}</div>
                              </>
                            ) : (
                              <>
                                {
                                  showValue === true ? (
                                    <>
                                      {val.value}
                                    </>
                                  ) : (
                                    <>
                                     {
                                        val.value === 0 ? (
                                          <>
                                          ?
                                          </>
                                        ) : (
                                          <>
                                          <FontAwesomeIcon icon={faCheckCircle}></FontAwesomeIcon>
                                          </>
                                        )
                                     }
                                    </>
                                  )
                                }
                              </>
                            )
                          }
                        </span>
                      </div>
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
                      <Button onClick={handleShowAllChange} value={user} style={{margin:"6px 12px", width:"100px"}} type='primary'>Show All</Button>
                      <Button onClick={handleResetChange} value={user} style={{margin:"6px 12px", width:"100px"}} type='primary' danger>Reset</Button>
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
