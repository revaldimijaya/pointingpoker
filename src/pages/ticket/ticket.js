import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';

const { TextArea } = Input;
function Ticket(param){
    console.log(param)
    return (
        <>
        <Form
            labelCol={{
            span: 6,
            }}
            wrapperCol={{
            span: 14,
            }}
            layout="horizontal"
            style={{
            maxWidth: 600,
            }}
        >
            <Form.Item label="Summary">
            <Input/>
            </Form.Item>
            <Form.Item label="Description">
            <TextArea rows={4}
                value={param.param.description}  
            />
            </Form.Item>
            <Form.Item label="Asignee">
            <Select>
                <Select.Option value="demo">Demo</Select.Option>
            </Select>
            </Form.Item>
            <Form.Item label="Label">
            <Select>
                <Select.Option value="Techplan">Techplan</Select.Option>
            </Select>
            </Form.Item>
            <Form.Item label="Total SP">
            <InputNumber
                controls
                defaultValue={Math.round(param.param.totalSP)}
                value={Math.round(param.param.totalSP)} 
            />
            </Form.Item>
        </Form>
        </>
    )
}

export default Ticket