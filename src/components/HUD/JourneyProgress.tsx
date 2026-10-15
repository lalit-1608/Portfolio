import React from 'react';
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Destination } from '../../types/game';
import { portfolioData } from '../../data/portfolio';
import { sounds } from '../../audio/soundEffects';

interface JourneyProgressProps {
  discoveredIds: string[];
  nearbyDestination: Destination | null;
  onOpenDestination: (dest: Destination) => void;
}

export const JourneyProgress: React.FC<JourneyProgressProps> = ({
  discoveredIds,
  nearbyDestination,
  onOpenDestination
}) => {
  return (
    <div className="journey-hud-overlay">
      {/* Nearby Destination Alert Pill */}
      {nearbyDestination && (
        <div className="nearby-alert-banner animate-slide-up">
          <div className="alert-badge">
            <MapPin size={16} className="pin-icon" />
            <span>APPROACHING DESTINATION</span>
          </div>
          <div className="alert-content">
            <h3 className="alert-title">{nearbyDestination.title}</h3>
            <p className="alert-subtitle">{nearbyDestination.subtitle}</p>
          </div>
          <button
            className="explore-btn"
            onClick={() => {
              sounds.playClick();
              onOpenDestination(nearbyDestination);
            }}
          >
            <span>Explore Station</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Checkpoints mini pill list */}
      <div className="checkpoints-pills">
        {portfolioData.destinations.map((dest) => {
          const isDiscovered = discoveredIds.includes(dest.id);
          const isCurrent = nearbyDestination?.id === dest.id;

          return (
            <button
              key={dest.id}
              className={`checkpoint-pill ${isDiscovered ? 'discovered' : 'locked'} ${
                isCurrent ? 'current' : ''
              }`}
              onClick={() => {
                sounds.playClick();
                onOpenDestination(dest);
              }}
              title={dest.title}
            >
              <div className="pill-status">
                {isDiscovered ? <CheckCircle2 size={13} /> : <span className="pill-dot" />}
              </div>
              <span className="pill-name">{dest.id.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
