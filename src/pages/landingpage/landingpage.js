import React, { useEffect, useState } from "react";
import {
  Layout,
  Input,
  Button,
  Form,
  Row,
  Image,
  Tooltip,
  Select,
  Card
} from "antd";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import "./landingpage.css";
import Particles from '../components/particle.js';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';

const { Header, Content, Footer } = Layout;


function Landingpage({keyProp}) {
  const navigate = useNavigate()
  const roomuuid = useParams() 

  const onFinish = (values) => {
    const unique_id = uuidv4();
    const small_id = unique_id.slice(0,8)
    const additionalData = { name: values.username+'#'+small_id, room: values.session, role: values.role.value };
    console.log(additionalData)
    navigate('/session', { state: additionalData });
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  
  const initialValue = {
    session: roomuuid.roomuuid === undefined ? uuidv4() : roomuuid.roomuuid ,
    role: { value: 'member', label: 'Member' }
  }

  return (
    <div>
    <Particles/>
    <Layout>
        <Row justify="center" align="middle" style={{minHeight: '100vh', flexDirection: 'column'}}>
          <Card>
            <Row style={{padding: "0px 50px 50px 50px"}}>
              <Image
                preview={false}
                width={200}
                src="https://static.thenounproject.com/png/1259530-200.png"
              />
            </Row>
            <Row >
              <Form
                style={{
                  width: 300,
                  maxWidth: 600,
                }}
                initialValues={initialValue}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Please input your username 3 - 15 characters!",
                      max: 15,
                      min: 3
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter your username"
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    suffix={
                      <Tooltip title="Extra information">
                        <InfoCircleOutlined
                          style={{
                            color: 'rgba(0,0,0,.45)',
                          }}
                        />
                      </Tooltip>
                    }
                  />
                </Form.Item>
                <Form.Item
                  name="role"
                  rules={[
                    {
                      required: true,
                      message: "Your role",
                    },
                  ]}
                >
                  <Select
                    labelInValue
                    options={[
                      {
                        value: 'member',
                        label: 'Member',
                      },
                      {
                        value: 'master',
                        label: 'Game Master',
                      },
                      {
                        value: 'observer',
                        label: 'Observer',
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="session"
                  rules={[
                    {
                      required: true,
                      message: "Your session",
                    },
                  ]}
                >
                  <Input addonBefore="Session"/>
                </Form.Item>
                <Form.Item style={{ display: 'flex', justifyContent: 'center' }} >
                  <Button type="primary" htmlType="submit">
                    Join / Create
                  </Button>
                </Form.Item>
              </Form>
            </Row>
          </Card>
        </Row>
    </Layout>
    </div>
  );
}

export default Landingpage;
