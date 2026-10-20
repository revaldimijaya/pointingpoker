import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VotePad } from './VotePad';
import { STORY_POINTS } from '../../constants';

const renderPad = (props = {}) =>
  render(<VotePad storyPoints={STORY_POINTS} selected={null} disabled={false} onVote={() => {}} {...props} />);

test('renders one button per story point', () => {
  renderPad();
  expect(screen.getAllByRole('button')).toHaveLength(STORY_POINTS.length);
});

test('calls onVote with the number when a button is pressed', () => {
  const onVote = jest.fn();
  renderPad({ onVote });
  userEvent.click(screen.getByRole('button', { name: '8' }));
  expect(onVote).toHaveBeenCalledWith(8);
});

test('marks only the selected vote aria-pressed', () => {
  renderPad({ selected: 5 });
  expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: '8' })).toHaveAttribute('aria-pressed', 'false');
});

test('disables every button when disabled', () => {
  renderPad({ disabled: true });
  screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
});
