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
} from "antd";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import "./landingpage.css";
import Particles from '../components/particle.js';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;


function Landingpage() {
  const navigate = useNavigate()

  const onFinish = (values) => {
    const additionalData = { name: values.username, room: values.session, role: values.role.value };
    console.log(additionalData)
    navigate('/session', { state: additionalData });
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const uuid = "test123"
  const initialValue = {
    session: uuid,
    role: { value: 'member', label: 'Member' }
  }

  return (
    <Layout>
      {/* <Particles/> */}
        <Row justify="center" align="middle" style={{minHeight: '100vh', flexDirection: 'column'}}>
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
                    message: "Please input your username!",
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
        </Row>
    </Layout>
  );
}

export default Landingpage;
