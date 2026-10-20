import { render, screen } from '@testing-library/react';
import { VoteCard } from './VoteCard';

const participant = (vote, name = 'Bob#2') => ({ id: 's2', name, role: 'member', vote });

test('shows the display name with (you) for the current user', () => {
  render(<VoteCard participant={participant(null, 'Alice#1')} isMe revealed={false} />);
  expect(screen.getByText('Alice (you)')).toBeInTheDocument();
});

test('shows the own vote, or ? when the current user has not voted', () => {
  const { rerender } = render(<VoteCard participant={participant(5)} isMe revealed={false} />);
  expect(screen.getByText('5')).toBeInTheDocument();
  rerender(<VoteCard participant={participant(null)} isMe revealed={false} />);
  expect(screen.getByText('?')).toBeInTheDocument();
});

test('shows ? for another participant who has not voted', () => {
  render(<VoteCard participant={participant(null)} isMe={false} revealed={false} />);
  expect(screen.getByText('?')).toBeInTheDocument();
});

test('shows an element named "voted" for another participant who voted, before reveal', () => {
  render(<VoteCard participant={participant(5)} isMe={false} revealed={false} />);
  expect(screen.getByLabelText('voted')).toBeInTheDocument();
  expect(screen.queryByText('5')).not.toBeInTheDocument();
});

test('shows the number for another participant after reveal', () => {
  render(<VoteCard participant={participant(5)} isMe={false} revealed />);
  expect(screen.getByText('5')).toBeInTheDocument();
  expect(screen.queryByLabelText('voted')).not.toBeInTheDocument();
});
