import { render, screen } from '@testing-library/react';
import { ParticipantList } from './ParticipantList';

const person = (id, name, role = 'member') => ({ id, name, role, vote: null });

test('renders only the groups that have people', () => {
  render(<ParticipantList participants={[person('g', 'Gm#1', 'master'), person('a', 'Alice#1')]} meId="a" />);
  expect(screen.getByText('Game Master')).toBeInTheDocument();
  expect(screen.getByText('Members')).toBeInTheDocument();
  expect(screen.queryByText('Observers')).not.toBeInTheDocument();
});

test('lists display names without the id suffix', () => {
  render(<ParticipantList participants={[person('a', 'Alice#1a2b3c4d')]} meId="x" />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.queryByText(/#/)).not.toBeInTheDocument();
});

test('lists two participants with the same display name', () => {
  render(<ParticipantList participants={[person('s1', 'Sam#1'), person('s2', 'Sam#2')]} meId="x" />);
  expect(screen.getAllByText('Sam')).toHaveLength(2);
});

test('marks only the participant whose id is meId with (you)', () => {
  render(<ParticipantList participants={[person('s1', 'Sam#1'), person('s2', 'Sam#2')]} meId="s2" />);
  expect(screen.getAllByText('(you)')).toHaveLength(1);
});
