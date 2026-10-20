import { Button, message } from 'antd';
import { CopyOutlined, TeamOutlined } from '@ant-design/icons';

// Room name, a copy-invite-link button, the connection status and, when
// `onOpenPeople` is given (phones), a button that opens the people list.
export function RoomHeader({ room, connected, participantCount, onOpenPeople }) {
  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/${encodeURIComponent(room)}`);
    message.success('Link copied');
  };

  return (
    <header className="room-header">
      <div className="room-header__title">
        <h1 className="room-header__room">{room}</h1>
        <Button type="text" icon={<CopyOutlined />} aria-label="Copy invite link" onClick={copyLink} />
      </div>
      <div className="room-header__status">
        <span
          className={`status-dot ${connected ? 'status-dot--online' : 'status-dot--offline'}`}
          aria-hidden="true"
        />
        <span>{connected ? 'Online' : 'Offline'}</span>
      </div>
      {onOpenPeople && (
        <Button icon={<TeamOutlined />} aria-label="Show people" onClick={onOpenPeople}>
          {participantCount}
        </Button>
      )}
    </header>
  );
}
