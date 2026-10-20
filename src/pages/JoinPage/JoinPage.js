import { useEffect, useMemo } from 'react';
import { Button, Card, Form, Image, Input, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ParticlesBackground from '../../components/ParticlesBackground';
import { ROLES, ROLE_LABELS } from '../../constants';
import './JoinPage.css';

const ROLE_OPTIONS = [ROLES.MEMBER, ROLES.MASTER, ROLES.OBSERVER].map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

// The page where a user picks a name, a role and a session, then enters the room.
export default function JoinPage() {
  const navigate = useNavigate();
  const { roomuuid } = useParams();
  const initialSession = useMemo(() => roomuuid ?? uuidv4(), [roomuuid]);

  // Leaving a room with the browser's Back button reloads this page, so the next
  // join starts from a clean state.
  useEffect(() => {
    window.onpopstate = () => {
      navigate('/' + (roomuuid ?? uuidv4()), { replace: true });
      window.location.reload();
    };
  }, [navigate, roomuuid]);

  const onFinish = ({ username, role, session }) => {
    const idSuffix = uuidv4().slice(0, 8);
    navigate('/session', { state: { name: `${username}#${idSuffix}`, room: session, role } });
  };

  return (
    <div className="join-page">
      <ParticlesBackground />
      <Card className="join-card">
        <div className="join-card__logo">
          <Image preview={false} width={200} src="https://static.thenounproject.com/png/1259530-200.png" />
        </div>
        <Form
          initialValues={{ session: initialSession, role: ROLES.MEMBER }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username 3 - 15 characters!', min: 3, max: 15 }]}
          >
            <Input placeholder="Enter your username" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="role" rules={[{ required: true, message: 'Your role' }]}>
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item name="session" rules={[{ required: true, message: 'Your session' }]}>
            <Input addonBefore="Session" />
          </Form.Item>
          <Form.Item className="join-card__submit">
            <Button type="primary" htmlType="submit">
              Join / Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
