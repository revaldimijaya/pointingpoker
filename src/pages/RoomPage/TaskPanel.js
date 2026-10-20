import { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import { ROLES } from '../../constants';

// The task being estimated and, after a reveal, its result. The Game Master edits
// the task; everyone else sees it as text.
export function TaskPanel({ role, description, result, onPublish, onCreateTicket }) {
  const [draft, setDraft] = useState(description);
  useEffect(() => setDraft(description), [description]);

  const publish = () => onPublish(draft.trim());

  // Once a result exists, show the task it was calculated for.
  const taskText = result ? result.task : description;

  return (
    <section className="task-panel" aria-label="Task">
      {role === ROLES.MASTER ? (
        <>
          <Input.TextArea
            aria-label="Task description"
            placeholder="Describe the task to vote on"
            autoSize={{ minRows: 2, maxRows: 5 }}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onPressEnter={(event) => {
              if (event.shiftKey) return;
              event.preventDefault();
              publish();
            }}
          />
          <div className="task-panel__actions">
            <Button type="primary" onClick={publish}>
              Set task
            </Button>
            <Button onClick={onCreateTicket}>Create Jira ticket</Button>
          </div>
        </>
      ) : (
        <p className="task-panel__task">{taskText || 'Waiting for the Game Master to set a task...'}</p>
      )}
      {result && (
        <div className="task-panel__result">
          <span className="task-panel__result-label">Average SP</span>
          <span className="task-panel__result-value" data-testid="average-sp">
            {result.average ?? ''}
          </span>
        </div>
      )}
    </section>
  );
}
