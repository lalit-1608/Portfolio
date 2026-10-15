import React from 'react';
import { Flame } from 'lucide-react';

interface SpeedometerProps {
  speedKmH: number;
  roadProgress: number; // 0 to 1
  isNitro?: boolean;
}

export const Speedometer: React.FC<SpeedometerProps> = ({ speedKmH, roadProgress, isNitro = false }) => {
  const maxDisplaySpeed = 38;
  const speedRatio = Math.min(1, Math.max(0, speedKmH / maxDisplaySpeed));

  // Determine virtual gear based on speed
  const gear = speedKmH > 28 ? 6 : speedKmH > 20 ? 5 : speedKmH > 13 ? 4 : speedKmH > 7 ? 3 : speedKmH > 2 ? 2 : 1;

  return (
    <div className={`speedometer-card racing-style ${isNitro ? 'nitro-active' : ''}`}>
      {/* Nitro active pulse badge */}
      {isNitro && (
        <div className="nitro-indicator animate-pulse">
          <Flame size={12} className="flame-icon" />
          <span>NITRO BOOST</span>
        </div>
      )}

      <div className="speedo-top">
        <div className="speedo-gear">
          <span className="gear-label">GEAR</span>
          <span className="gear-val">{speedKmH > 0 ? (isNitro ? 'R' : gear) : 'N'}</span>
        </div>
        <div className="speedo-main">
          <span className="speed-number">{speedKmH}</span>
          <span className="speed-unit">KM/H</span>
        </div>
        <div className="speedo-lap">
          <span className="lap-label">TOUR</span>
          <span className="lap-val">{Math.round(roadProgress * 100)}%</span>
        </div>
      </div>

      <div className="speedo-bar-track">
        <div
          className={`speedo-bar-fill ${isNitro ? 'nitro-bar' : ''}`}
          style={{ width: `${Math.round(speedRatio * 100)}%` }}
        />
      </div>
    </div>
  );
};
