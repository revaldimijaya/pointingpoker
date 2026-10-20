import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomHeader } from './RoomHeader';

const renderHeader = (props = {}) =>
  render(<RoomHeader room="demo-room" connected participantCount={3} {...props} />);

test('shows the room name and Online or Offline', () => {
  const { rerender } = renderHeader();
  expect(screen.getByText('demo-room')).toBeInTheDocument();
  expect(screen.getByText('Online')).toBeInTheDocument();
  rerender(<RoomHeader room="demo-room" connected={false} participantCount={3} />);
  expect(screen.getByText('Offline')).toBeInTheDocument();
});

test('copy writes origin + /room to the clipboard and shows Link copied', async () => {
  const writeText = jest.fn().mockResolvedValue();
  Object.assign(navigator, { clipboard: { writeText } });
  renderHeader();
  userEvent.click(screen.getByRole('button', { name: 'Copy invite link' }));
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/demo-room`);
  expect(await screen.findByText('Link copied')).toBeInTheDocument();
});

test('shows the people button with the count only when onOpenPeople is given', () => {
  const { rerender } = renderHeader();
  expect(screen.queryByRole('button', { name: 'Show people' })).not.toBeInTheDocument();
  rerender(<RoomHeader room="demo-room" connected participantCount={3} onOpenPeople={() => {}} />);
  expect(screen.getByRole('button', { name: 'Show people' })).toHaveTextContent('3');
});
