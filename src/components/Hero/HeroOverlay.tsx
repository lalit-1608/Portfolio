import React from 'react';
import { Bike, FolderGit2, ArrowRight, Award, Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import { sounds } from '../../audio/soundEffects';

interface HeroOverlayProps {
  onStartJourney: () => void;
  onExploreProjects: () => void;
  onOpenRecruiterView: () => void;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  onStartJourney,
  onExploreProjects,
  onOpenRecruiterView
}) => {
  return (
    <div className="hero-fullscreen-overlay animate-fade-in">
      <div className="hero-content-wrapper recruiter-enhanced">
        {/* Availability & Recruiter Priority Badge */}
        <div className="hero-badge-pill">
          <span className="pulse-dot-green" />
          <span className="availability-text">{portfolioData.availability}</span>
        </div>

        {/* Master Headline */}
        <h1 className="hero-title">
          Every great journey starts with a <span className="highlight-text">single ride</span>.
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          I'm <strong className="hero-name">{portfolioData.name}</strong> — {portfolioData.tagline}
        </p>

        {/* Executive Recruiter Highlights Strip */}
        <div className="recruiter-stat-strip">
          <div className="strip-item">
            <Briefcase size={15} className="strip-icon" />
            <span><strong>6 Mo</strong> Full-Stack Intern @ LebMentix</span>
          </div>
          <div className="strip-item">
            <Award size={15} className="strip-icon" />
            <span><strong>Deloitte Certified</strong> (Cyber & Data)</span>
          </div>
          <div className="strip-item">
            <GraduationCap size={15} className="strip-icon" />
            <span>B.Tech CSE (<strong>CGPA {portfolioData.cgpa}</strong>)</span>
          </div>
          <div className="strip-item">
            <CheckCircle2 size={15} className="strip-icon" />
            <span><strong>4 Live</strong> Deployed Web Apps</span>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="hero-cta-group">
          <button
            className="hero-primary-btn"
            onClick={() => {
              sounds.playClick();
              onStartJourney();
            }}
          >
            <Bike size={20} />
            <span>RIDE 3D CITY WORLD</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="hero-secondary-btn"
            onClick={() => {
              sounds.playClick();
              onExploreProjects();
            }}
          >
            <FolderGit2 size={18} />
            <span>EXPLORE 4 LIVE APPS</span>
          </button>
        </div>

        {/* Fast Recruiter Skip Link */}
        <div className="hero-footer-hint">
          <span>Short on time?</span>
          <button
            className="recruiter-quick-link"
            onClick={() => {
              sounds.playClick();
              onOpenRecruiterView();
            }}
          >
            ⚡ Open Recruiter 1-Pager (ATS Layout & Fast Review) →
          </button>
        </div>
      </div>
    </div>
  );
};
