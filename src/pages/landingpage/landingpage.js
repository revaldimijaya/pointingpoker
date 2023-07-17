import React, { useEffect, useState } from "react";
import {
  Layout,
  Input,
  Button,
  Form,
  Row,
  Image,
  Tooltip,
} from "antd";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import "./landingpage.css";

const { Header, Content, Footer } = Layout;
const onFinish = (values) => {
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

function Landingpage() {
  return (
    <Layout>
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
              initialValues={{
                remember: true,
              }}
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
                name="session"
                rules={[
                  {
                    required: true,
                    message: "Your session",
                  },
                ]}
              >
                <Input addonBefore="Session" />
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
