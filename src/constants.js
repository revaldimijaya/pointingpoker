export const ROLES = {
  MASTER: 'master',
  MEMBER: 'member',
  OBSERVER: 'observer',
};

export const ROLE_LABELS = {
  [ROLES.MASTER]: 'Game Master',
  [ROLES.MEMBER]: 'Member',
  [ROLES.OBSERVER]: 'Observer',
};

export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21, 34];

// Socket event names. Keep in sync with the server's events.js.
export const EVENTS = {
  JOIN_ROOM: 'joinRoom',
  VOTE: 'vote',
  REVEAL: 'reveal',
  RESET: 'reset',
  DESCRIPTION: 'description',
  RESULT: 'result',
  PARTICIPANTS: 'participants',
};
