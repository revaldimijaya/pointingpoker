import { useState } from 'react';
import { Modal } from 'antd';
import { Navigate, useLocation } from 'react-router-dom';
import { ROLES, STORY_POINTS } from '../../constants';
import TicketForm from '../TicketForm/TicketForm';
import { MasterControls } from './MasterControls';
import { ParticipantList } from './ParticipantList';
import { RoomHeader } from './RoomHeader';
import { TaskPanel } from './TaskPanel';
import { VoteCard } from './VoteCard';
import { VotePad } from './VotePad';
import { useRoomSocket } from './useRoomSocket';
import './RoomPage.css';

// What the bottom of the room offers each role.
function Dock({ role, selectedVote, revealed, onVote, onReveal, onReset }) {
  if (role === ROLES.MEMBER) {
    return <VotePad storyPoints={STORY_POINTS} selected={selectedVote} disabled={revealed} onVote={onVote} />;
  }
  if (role === ROLES.MASTER) {
    return <MasterControls onReveal={onReveal} onReset={onReset} />;
  }
  return <p className="dock__note">You're observing</p>;
}

function Room({ room, name, role }) {
  const { me, connected, participants, description, revealed, result, vote, reveal, reset, publishDescription } =
    useRoomSocket({ room, name, role });
  const [ticketOpen, setTicketOpen] = useState(false);
  const members = participants.filter((participant) => participant.role === ROLES.MEMBER);

  return (
    <div className="room">
      <RoomHeader room={room} connected={connected} participantCount={participants.length} />
      <div className="room__body">
        <main className="room__main">
          <TaskPanel
            role={role}
            description={description}
            result={result}
            onPublish={publishDescription}
            onCreateTicket={() => setTicketOpen(true)}
          />
          <div className="card-grid">
            {members.map((participant) => (
              <VoteCard
                key={participant.id}
                participant={participant}
                isMe={participant.id === me?.id}
                revealed={revealed}
              />
            ))}
          </div>
        </main>
        <aside className="room__people">
          <ParticipantList participants={participants} meId={me?.id} />
        </aside>
      </div>
      <footer className="dock">
        <Dock
          role={role}
          selectedVote={me?.vote ?? null}
          revealed={revealed}
          onVote={vote}
          onReveal={reveal}
          onReset={reset}
        />
      </footer>
      <Modal title="Jira Ticket" open={ticketOpen} onCancel={() => setTicketOpen(false)} footer={null} destroyOnClose>
        <TicketForm description={description} totalSP={result?.average} />
      </Modal>
    </div>
  );
}

// The room needs the name, room and role the join page passes along; without them, go back to join.
export default function RoomPage() {
  const { state } = useLocation();
  if (!state || !state.room || !state.name || !state.role) return <Navigate to="/" replace />;
  return <Room room={state.room} name={state.name} role={state.role} />;
}
