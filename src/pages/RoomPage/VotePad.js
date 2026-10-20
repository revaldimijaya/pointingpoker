import { Button } from 'antd';

export function VotePad({ storyPoints, selected, disabled, onVote }) {
  return (
    <div className="vote-pad" role="group" aria-label="Story points">
      {storyPoints.map((points) => (
        <Button
          key={points}
          className="vote-pad__button"
          type={selected === points ? 'primary' : 'default'}
          aria-pressed={selected === points}
          disabled={disabled}
          onClick={() => onVote(points)}
        >
          {points}
        </Button>
      ))}
    </div>
  );
}
