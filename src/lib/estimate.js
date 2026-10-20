import { ROLES } from '../constants';

// Average vote of the members who have voted, to one decimal; null when no member has.
export function averageVote(participants) {
  const votes = participants
    .filter((participant) => participant.role === ROLES.MEMBER && typeof participant.vote === 'number')
    .map((participant) => participant.vote);
  if (votes.length === 0) return null;
  const mean = votes.reduce((sum, vote) => sum + vote, 0) / votes.length;
  return Math.round(mean * 10) / 10;
}
