import React, { useEffect } from 'react';
import { X, Bike } from 'lucide-react';
import type { Destination, DestinationId } from '../../types/game';
import { portfolioData } from '../../data/portfolio';
import { AboutSection } from './AboutSection';
import { SkillsSection } from './SkillsSection';
import { ProjectsSection } from './ProjectsSection';
import { ExperienceSection } from './ExperienceSection';
import { ContactSection } from './ContactSection';
import { sounds } from '../../audio/soundEffects';

interface DestinationModalProps {
  destination: Destination;
  onClose: () => void;
  onSwitchDestination: (id: DestinationId) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  onSwitchDestination
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="destination-modal-container animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={destination.title}
      >
        {/* Top Header Bar */}
        <div className="modal-top-bar">
          <div className="modal-breadcrumbs">
            <span className="station-number">STATION 0{destination.index + 1}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-title">{destination.title}</span>
          </div>

          <div className="modal-controls">
            <button
              className="resume-ride-btn"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              title="Return to 3D Cycling"
            >
              <Bike size={16} />
              <span>Continue Riding</span>
            </button>
            <button
              className="modal-close-icon-btn"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Destination Switcher Tabs */}
        <div className="modal-station-tabs">
          {portfolioData.destinations.map((d) => (
            <button
              key={d.id}
              className={`station-tab ${d.id === destination.id ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick();
                onSwitchDestination(d.id);
              }}
            >
              <span className="tab-num">0{d.index + 1}</span>
              <span className="tab-name">
                {d.id === 'about' && 'About'}
                {d.id === 'skills' && 'Skills'}
                {d.id === 'projects' && 'Projects'}
                {d.id === 'experience' && 'Experience'}
                {d.id === 'contact' && 'Contact'}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-scroll-area">
          {destination.id === 'about' && (
            <AboutSection onExploreProjects={() => onSwitchDestination('projects')} />
          )}
          {destination.id === 'skills' && <SkillsSection />}
          {destination.id === 'projects' && <ProjectsSection />}
          {destination.id === 'experience' && <ExperienceSection />}
          {destination.id === 'contact' && <ContactSection />}
        </div>
      </div>
    </div>
  );
};
