import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  Layout,
  Menu,
  theme,
  Input,
  Tooltip,
  Button,
  Checkbox,
  Form,
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
    <Layout className="layout">
      <Header
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="demo-logo" />
        <h3 className="header-title"> Pointing Poker </h3>{" "}
      </Header>{" "}
      <Content  style={{
          padding: '0 50px',
        }}>
        <Breadcrumb
          style={{
            margin: "16px 0",
          }}
        >
          <Breadcrumb.Item>Pointing Poker</Breadcrumb.Item>
        </Breadcrumb>
        <Form
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
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
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input />
          </Form.Item>{" "}
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit{" "}
            </Button>{" "}
          </Form.Item>{" "}
        </Form>{" "}
      </Content>{" "}
    </Layout>
  );
}

export default Landingpage;
