import React from 'react';
import { ArrowUp, ArrowLeft, ArrowRight, Flame } from 'lucide-react';
import type { GameControls } from '../../types/game';

interface MobileControlsProps {
  onUpdateControls: (controls: Partial<GameControls>) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onUpdateControls }) => {
  const handleTouchStart = (key: keyof GameControls) => {
    onUpdateControls({ [key]: true });
  };

  const handleTouchEnd = (key: keyof GameControls) => {
    onUpdateControls({ [key]: false });
  };

  return (
    <div className="mobile-touch-controls">
      {/* Steering Buttons (Left / Right) */}
      <div className="mobile-steer-group">
        <button
          className="touch-btn steer-btn"
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={() => handleTouchEnd('left')}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          aria-label="Steer Left"
        >
          <ArrowLeft size={24} />
        </button>

        <button
          className="touch-btn steer-btn"
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={() => handleTouchEnd('right')}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          aria-label="Steer Right"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      {/* Throttle, Nitro & Brake Buttons */}
      <div className="mobile-throttle-group">
        <button
          className="touch-btn brake-btn"
          onTouchStart={() => handleTouchStart('brake')}
          onTouchEnd={() => handleTouchEnd('brake')}
          onMouseDown={() => handleTouchStart('brake')}
          onMouseUp={() => handleTouchEnd('brake')}
          aria-label="Brake"
        >
          <span>STOP</span>
        </button>

        <button
          className="touch-btn nitro-touch-btn"
          onTouchStart={() => handleTouchStart('nitro')}
          onTouchEnd={() => handleTouchEnd('nitro')}
          onMouseDown={() => handleTouchStart('nitro')}
          onMouseUp={() => handleTouchEnd('nitro')}
          aria-label="Nitro Boost"
        >
          <Flame size={20} />
          <span>NITRO</span>
        </button>

        <button
          className="touch-btn pedal-btn"
          onTouchStart={() => handleTouchStart('forward')}
          onTouchEnd={() => handleTouchEnd('forward')}
          onMouseDown={() => handleTouchStart('forward')}
          onMouseUp={() => handleTouchEnd('forward')}
          aria-label="Pedal Forward"
        >
          <ArrowUp size={28} />
          <span>PEDAL</span>
        </button>
      </div>
    </div>
  );
};
