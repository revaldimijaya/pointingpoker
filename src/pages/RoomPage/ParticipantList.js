import { UserOutlined } from '@ant-design/icons';
import { ROLES } from '../../constants';
import { displayName } from '../../lib/names';

const GROUPS = [
  { role: ROLES.MASTER, title: 'Game Master' },
  { role: ROLES.MEMBER, title: 'Members' },
  { role: ROLES.OBSERVER, title: 'Observers' },
];

// Everyone in the room, grouped by role; a group with nobody in it is not shown.
export function ParticipantList({ participants, meId }) {
  return (
    <div className="participant-list">
      {GROUPS.map(({ role, title }) => {
        const people = participants.filter((participant) => participant.role === role);
        if (people.length === 0) return null;
        return (
          <section key={role} className="participant-list__group">
            <h4 className="participant-list__title">{title}</h4>
            <ul className="participant-list__items">
              {people.map((participant) => (
                <li key={participant.id} className="participant-list__item">
                  <UserOutlined aria-hidden="true" /> <span>{displayName(participant.name)}</span>
                  {participant.id === meId && <span className="participant-list__you">(you)</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
