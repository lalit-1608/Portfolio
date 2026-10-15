import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';

interface WebGLFallbackProps {
  onSwitchToRecruiterView: () => void;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({ onSwitchToRecruiterView }) => {
  return (
    <div className="webgl-fallback-container">
      <div className="fallback-card">
        <AlertTriangle size={36} className="fallback-icon" />
        <h2>3D Graphics Acceleration Unavailable</h2>
        <p>
          Your browser or device does not support WebGL hardware acceleration, or graphics resources are temporarily restricted.
        </p>
        <p>
          Don't worry! You can explore the full developer portfolio of <strong>{portfolioData.name}</strong> in our clean 2D reading mode.
        </p>
        <button className="primary-action-btn" onClick={onSwitchToRecruiterView}>
          <FileText size={18} />
          <span>Switch to 2D Portfolio View</span>
        </button>
      </div>
    </div>
  );
};
