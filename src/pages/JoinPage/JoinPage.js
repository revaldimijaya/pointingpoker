import { useEffect, useMemo } from 'react';
import { Button, Card, Form, Grid, Input, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import logo from '../../assets/logo.svg';
import ParticlesBackground from '../../components/ParticlesBackground';
import { ROLES, ROLE_LABELS } from '../../constants';
import './JoinPage.css';

const ROLE_OPTIONS = [ROLES.MEMBER, ROLES.MASTER, ROLES.OBSERVER].map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

const ROLE_HINTS = {
  [ROLES.MEMBER]: 'Votes on each task.',
  [ROLES.MASTER]: 'Sets the task and reveals the votes.',
  [ROLES.OBSERVER]: 'Watches without voting.',
};

// The page where a user picks a name, a role and a session, then enters the room.
export default function JoinPage() {
  const navigate = useNavigate();
  const { roomuuid } = useParams();
  const [form] = Form.useForm();
  const selectedRole = Form.useWatch('role', form);
  const initialSession = useMemo(() => roomuuid ?? uuidv4(), [roomuuid]);

  // The animated background is skipped on phones and for users who prefer less motion.
  const showParticles = Grid.useBreakpoint().md && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      {showParticles && <ParticlesBackground />}
      <Card className="join-card">
        <div className="join-card__logo">
          <img src={logo} alt="Pointing Poker" />
        </div>
        <Form
          form={form}
          initialValues={{ session: initialSession, role: ROLES.MEMBER }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username 3 - 15 characters!', min: 3, max: 15 }]}
          >
            <Input size="large" placeholder="Enter your username" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Your role' }]}
            extra={ROLE_HINTS[selectedRole]}
          >
            <Select size="large" options={ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item name="session" rules={[{ required: true, message: 'Your session' }]}>
            <Input size="large" addonBefore="Session" />
          </Form.Item>
          <Form.Item className="join-card__submit">
            <Button type="primary" size="large" htmlType="submit">
              Join / Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
