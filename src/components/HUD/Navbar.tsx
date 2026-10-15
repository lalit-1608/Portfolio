import React from 'react';
import { Volume2, VolumeX, RotateCcw, FileText, Bike } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import type { DestinationId, ViewMode } from '../../types/game';
import { sounds } from '../../audio/soundEffects';

interface NavbarProps {
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetRide: () => void;
  onNavigateSection: (id: DestinationId) => void;
  activeDestinationId?: DestinationId;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onToggleViewMode,
  isMuted,
  onToggleMute,
  onResetRide,
  onNavigateSection,
  activeDestinationId
}) => {
  return (
    <header className="floating-navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <button
          className="brand-logo"
          onClick={() => onNavigateSection('about')}
          title="Return to Home"
        >
          <span className="logo-badge">{portfolioData.initials}</span>
          <div className="brand-text">
            <span className="brand-name">{portfolioData.name}</span>
            <span className="brand-sub">Portfolio World</span>
          </div>
        </button>

        {/* Navigation Destination Links */}
        <nav className="nav-links">
          {portfolioData.destinations.map((dest) => {
            const isActive = activeDestinationId === dest.id;
            return (
              <button
                key={dest.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  onNavigateSection(dest.id);
                }}
              >
                {dest.id === 'about' && 'About'}
                {dest.id === 'skills' && 'Skills'}
                {dest.id === 'projects' && 'Projects'}
                {dest.id === 'experience' && 'Experience'}
                {dest.id === 'contact' && 'Contact'}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Mode Switch: 3D Ride vs 2D Recruiter View */}
          <button
            className={`action-btn mode-toggle ${viewMode === 'recruiter' ? 'active-mode' : ''}`}
            onClick={() => {
              sounds.playClick();
              onToggleViewMode();
            }}
            title={viewMode === 'game' ? 'Switch to Recruiter Quick View' : 'Back to 3D Ride Mode'}
          >
            {viewMode === 'game' ? (
              <>
                <FileText size={16} />
                <span className="btn-label">Recruiter View</span>
              </>
            ) : (
              <>
                <Bike size={16} />
                <span className="btn-label">Ride World</span>
              </>
            )}
          </button>

          {/* Reset position button (in game mode) */}
          {viewMode === 'game' && (
            <button
              className="action-btn icon-only"
              onClick={() => {
                sounds.playClick();
                onResetRide();
              }}
              title="Reset to Starting Village"
            >
              <RotateCcw size={16} />
            </button>
          )}

          {/* Sound toggle */}
          <button
            className={`action-btn icon-only ${isMuted ? 'muted' : ''}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
