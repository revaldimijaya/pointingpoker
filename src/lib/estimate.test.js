import { averageVote } from './estimate';
import { ROLES } from '../constants';

const participant = (vote, role = ROLES.MEMBER) => ({ id: 'x', name: 'x#1', role, vote });

test('averages only members who have voted', () => {
  expect(averageVote([participant(5), participant(5), participant(null)])).toBe(5);
});

test('ignores the Game Master and observers', () => {
  expect(averageVote([participant(3), participant(5), participant(13, ROLES.MASTER)])).toBe(4);
});

test('rounds to one decimal', () => {
  expect(averageVote([participant(1), participant(2), participant(2)])).toBe(1.7);
});

test('returns null when nobody has voted', () => {
  expect(averageVote([participant(null), participant(null, ROLES.MASTER)])).toBeNull();
});

test('returns null for an empty list', () => {
  expect(averageVote([])).toBeNull();
});
