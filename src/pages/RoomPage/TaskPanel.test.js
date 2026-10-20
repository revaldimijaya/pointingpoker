import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskPanel } from './TaskPanel';
import { ROLES } from '../../constants';

const renderPanel = (props = {}) =>
  render(
    <TaskPanel
      role={ROLES.MASTER}
      description=""
      result={null}
      onPublish={() => {}}
      onCreateTicket={() => {}}
      {...props}
    />,
  );

test('Game Master sees a textarea and Set task, which calls onPublish with the typed text', () => {
  const onPublish = jest.fn();
  renderPanel({ onPublish });
  userEvent.type(screen.getByRole('textbox'), 'PTP-1 Login');
  userEvent.click(screen.getByRole('button', { name: 'Set task' }));
  expect(onPublish).toHaveBeenCalledWith('PTP-1 Login');
});

test('pressing Enter in the textarea also publishes', () => {
  const onPublish = jest.fn();
  renderPanel({ onPublish });
  userEvent.type(screen.getByRole('textbox'), 'PTP-2{enter}');
  expect(onPublish).toHaveBeenCalledWith('PTP-2');
});

test('Game Master Create Jira ticket button calls onCreateTicket', () => {
  const onCreateTicket = jest.fn();
  renderPanel({ onCreateTicket });
  userEvent.click(screen.getByRole('button', { name: 'Create Jira ticket' }));
  expect(onCreateTicket).toHaveBeenCalledTimes(1);
});

test('members see the task as text and no textbox', () => {
  renderPanel({ role: ROLES.MEMBER, description: 'PTP-1 Login' });
  expect(screen.getByText('PTP-1 Login')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Set task' })).not.toBeInTheDocument();
});

test('members see the waiting message when the description is empty', () => {
  renderPanel({ role: ROLES.OBSERVER, description: '' });
  expect(screen.getByText('Waiting for the Game Master to set a task...')).toBeInTheDocument();
});

test('shows Average SP and the number once a result arrives', () => {
  renderPanel({ result: { average: 4.5, task: 'PTP-1' } });
  expect(screen.getByText('Average SP')).toBeInTheDocument();
  expect(screen.getByTestId('average-sp')).toHaveTextContent('4.5');
});

test('members see the task that was revealed', () => {
  renderPanel({ role: ROLES.MEMBER, description: 'newer text', result: { average: 4.5, task: 'PTP-1' } });
  expect(screen.getByText('PTP-1')).toBeInTheDocument();
  expect(screen.queryByText('newer text')).not.toBeInTheDocument();
});

test('shows no number when the average is null', () => {
  renderPanel({ result: { average: null, task: '' } });
  expect(screen.getByTestId('average-sp').textContent).toBe('');
  expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
});

test('hides the Average SP row until a result arrives', () => {
  renderPanel({ result: null });
  expect(screen.queryByText('Average SP')).not.toBeInTheDocument();
});
