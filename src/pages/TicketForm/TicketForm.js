import { Form, Input, InputNumber, Select } from 'antd';

// Placeholder for a future Jira integration: the fields are not wired to anything yet.
export default function TicketForm({ description, totalSP }) {
  return (
    <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} layout="horizontal">
      <Form.Item label="Summary">
        <Input />
      </Form.Item>
      <Form.Item label="Description">
        <Input.TextArea rows={4} defaultValue={description} />
      </Form.Item>
      <Form.Item label="Assignee">
        <Select options={[{ value: 'demo', label: 'Demo' }]} />
      </Form.Item>
      <Form.Item label="Label">
        <Select options={[{ value: 'Techplan', label: 'Techplan' }]} />
      </Form.Item>
      <Form.Item label="Total SP">
        <InputNumber defaultValue={typeof totalSP === 'number' ? Math.round(totalSP) : undefined} />
      </Form.Item>
    </Form>
  );
}
