import React, { useState } from 'react';
import { Keyboard, HelpCircle, X } from 'lucide-react';

export const ControlsTutorial: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        className="tutorial-pill-toggle"
        onClick={() => setCollapsed(false)}
        title="Show Game Controls"
      >
        <HelpCircle size={15} />
        <span>Controls</span>
      </button>
    );
  }

  return (
    <div className="controls-tutorial-bar">
      <div className="tutorial-header">
        <Keyboard size={15} className="tutorial-icon" />
        <span className="tutorial-heading">CYCLING CONTROLS</span>
        <button
          className="tutorial-close-btn"
          onClick={() => setCollapsed(true)}
          title="Minimize controls guide"
        >
          <X size={13} />
        </button>
      </div>

      <div className="key-hints-list">
        <div className="key-hint">
          <kbd>W</kbd> / <kbd>↑</kbd> <span>Pedal Forward</span>
        </div>
        <div className="key-hint">
          <kbd>A</kbd> <kbd>D</kbd> / <kbd>←</kbd> <kbd>→</kbd> <span>Steer</span>
        </div>
        <div className="key-hint">
          <kbd>S</kbd> / <kbd>↓</kbd> <span>Reverse</span>
        </div>
        <div className="key-hint">
          <kbd>Space</kbd> <span>Brake</span>
        </div>
        <div className="key-hint nitro-hint">
          <kbd>Shift</kbd> <span>Nitro Boost 🔥</span>
        </div>
      </div>
    </div>
  );
};
