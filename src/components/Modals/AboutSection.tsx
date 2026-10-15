import React from 'react';
import { User, Sparkles, ArrowRight, Briefcase, GraduationCap, Award, ExternalLink, Download } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import { GithubIcon } from '../common/BrandIcons';
import { sounds } from '../../audio/soundEffects';

interface AboutSectionProps {
  onExploreProjects: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onExploreProjects }) => {
  return (
    <div className="destination-content about-section">
      {/* Intro Hero Card */}
      <div className="about-hero-card">
        <div className="about-avatar-wrapper">
          <div className="about-avatar-placeholder">
            <span className="avatar-initials">{portfolioData.initials}</span>
          </div>
          <div className="online-badge" title="Actively interviewing for software engineering roles">
            <span className="pulse-dot" />
            <span>Ready to Join</span>
          </div>
        </div>

        <div className="about-hero-text">
          <span className="section-eyebrow">DESTINATION 01 / STARTING VILLAGE</span>
          <h2 className="about-heading">{portfolioData.name}</h2>
          <p className="about-role-tagline">{portfolioData.role}</p>
          <p className="about-summary">{portfolioData.bio.summary}</p>
          
          <div className="about-cta-row">
            <button
              className="primary-action-btn"
              onClick={() => {
                sounds.playClick();
                onExploreProjects();
              }}
            >
              <span>Explore 4 Live Projects</span>
              <ArrowRight size={16} />
            </button>
            <a
              href={portfolioData.github}
              target="_blank"
              rel="noreferrer"
              className="secondary-action-btn"
              onClick={() => sounds.playClick()}
            >
              <GithubIcon size={16} />
              <span>GitHub (lalit-1608)</span>
            </a>
            <a
              href={portfolioData.resumeUrl}
              download="Lalit_Chauhan_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-action-btn"
              onClick={() => sounds.playClick()}
            >
              <Download size={15} />
              <span>Resume (PDF)</span>
            </a>
            <a
              href={`mailto:${portfolioData.email}`}
              className="secondary-action-btn"
              onClick={() => sounds.playClick()}
            >
              <span>Email Lalit</span>
            </a>
          </div>
        </div>
      </div>

      {/* Recruiter Quick Fact Cards */}
      <div className="recruiter-pill-grid">
        <div className="recruiter-pill-card">
          <div className="pill-card-icon-wrap">
            <Briefcase size={20} className="pill-icon red-accent" />
          </div>
          <div>
            <span className="pill-card-label">Industry Internship</span>
            <strong className="pill-card-title">LebMentix (6 Months)</strong>
            <p className="pill-card-sub">Full-Stack Web Engineering</p>
          </div>
        </div>

        <div className="recruiter-pill-card">
          <div className="pill-card-icon-wrap">
            <Award size={20} className="pill-icon blue-accent" />
          </div>
          <div>
            <span className="pill-card-label">Corporate Certifications</span>
            <strong className="pill-card-title">Deloitte (2 Programs)</strong>
            <p className="pill-card-sub">Cybersecurity & Data Analytics</p>
          </div>
        </div>

        <div className="recruiter-pill-card">
          <div className="pill-card-icon-wrap">
            <GraduationCap size={20} className="pill-icon green-accent" />
          </div>
          <div>
            <span className="pill-card-label">Academic CSE Standing</span>
            <strong className="pill-card-title">CGPA: {portfolioData.cgpa}</strong>
            <p className="pill-card-sub">B.Tech Computer Science (2022-26)</p>
          </div>
        </div>

        <div className="recruiter-pill-card">
          <div className="pill-card-icon-wrap">
            <ExternalLink size={20} className="pill-icon purple-accent" />
          </div>
          <div>
            <span className="pill-card-label">Production Delivery</span>
            <strong className="pill-card-title">4 Live Deployed Apps</strong>
            <p className="pill-card-sub">Render, Vercel & GitHub Pages</p>
          </div>
        </div>
      </div>

      {/* Extended Bio & Philosophy */}
      <div className="about-grid">
        <div className="content-card bio-card">
          <div className="card-header">
            <User size={18} className="card-icon" />
            <h3>My Experience & Engineering Mindset</h3>
          </div>
          <div className="card-body">
            {portfolioData.bio.extended.map((paragraph, index) => (
              <p key={index} className="bio-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="content-card philosophy-card">
          <div className="card-header">
            <Sparkles size={18} className="card-icon" />
            <h3>Why Hire Lalit Chauhan?</h3>
          </div>
          <div className="card-body">
            <blockquote className="philosophy-quote">
              "{portfolioData.bio.philosophy}"
            </blockquote>

            <div className="interests-section">
              <h4 className="interests-title">Core Competencies</h4>
              <div className="tag-cloud">
                {portfolioData.bio.interests.map((interest, i) => (
                  <span key={i} className="interest-tag">
                    <span className="tag-bullet">•</span>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
