import { Button } from 'antd';

export function MasterControls({ onReveal, onReset }) {
  return (
    <div className="master-controls">
      <Button type="primary" onClick={onReveal}>
        Show All
      </Button>
      <Button type="primary" danger onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
