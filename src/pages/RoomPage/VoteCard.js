import { Card } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { displayName } from '../../lib/names';

// One member's card: their own vote is always visible to them; everyone else's is
// hidden behind a check mark until the Game Master reveals.
export function VoteCard({ participant, isMe, revealed }) {
  const hasVoted = typeof participant.vote === 'number';
  let value = '?';
  if (hasVoted) {
    value = isMe || revealed ? participant.vote : <CheckCircleOutlined aria-label="voted" />;
  }
  const name = displayName(participant.name);

  return (
    <Card className="vote-card" title={isMe ? `${name} (you)` : name}>
      <div className="vote-card__value">{value}</div>
    </Card>
  );
}
