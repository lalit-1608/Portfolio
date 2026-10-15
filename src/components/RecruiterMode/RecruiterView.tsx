import React from 'react';
import { Bike, Download, Briefcase, GraduationCap, Award, Globe } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import { AboutSection } from '../Modals/AboutSection';
import { SkillsSection } from '../Modals/SkillsSection';
import { ProjectsSection } from '../Modals/ProjectsSection';
import { ExperienceSection } from '../Modals/ExperienceSection';
import { ContactSection } from '../Modals/ContactSection';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons';
import { sounds } from '../../audio/soundEffects';

interface RecruiterViewProps {
  onBackToRide: () => void;
}

export const RecruiterView: React.FC<RecruiterViewProps> = ({ onBackToRide }) => {
  return (
    <div className="recruiter-view-container animate-fade-in">
      {/* Recruiter Header Bar */}
      <header className="recruiter-header-bar">
        <div className="recruiter-brand">
          <span className="logo-badge">{portfolioData.initials}</span>
          <div>
            <h1 className="recruiter-name">{portfolioData.name}</h1>
            <p className="recruiter-role">{portfolioData.role}</p>
          </div>
        </div>

        <div className="recruiter-header-actions">
          <a
            href={portfolioData.github}
            target="_blank"
            rel="noreferrer"
            className="recruiter-action-link"
            title="GitHub Profile"
          >
            <GithubIcon size={16} />
            <span>GitHub</span>
          </a>

          <a
            href={portfolioData.linkedin}
            target="_blank"
            rel="noreferrer"
            className="recruiter-action-link"
            title="LinkedIn Profile"
          >
            <LinkedinIcon size={16} />
            <span>LinkedIn</span>
          </a>

          <a
            href={portfolioData.resumeUrl}
            className="recruiter-action-link download-btn"
            download="Lalit_Chauhan_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={15} />
            <span>Resume (PDF)</span>
          </a>

          <button
            className="back-to-ride-btn"
            onClick={() => {
              sounds.playClick();
              onBackToRide();
            }}
          >
            <Bike size={18} />
            <span>Launch 3D City Experience</span>
          </button>
        </div>
      </header>

      {/* Recruiter Executive Summary Billboard */}
      <div className="recruiter-executive-billboard">
        <div className="billboard-container">
          <div className="availability-tag">
            <span className="pulse-dot" />
            <span>{portfolioData.availability}</span>
          </div>
          <h2 className="billboard-headline">
            {portfolioData.tagline}
          </h2>
          
          <div className="executive-highlights-grid">
            <div className="highlight-pill">
              <Briefcase size={16} className="highlight-icon red-accent" />
              <div>
                <strong>6 Months Full-Stack Intern</strong>
                <span>LebMentix</span>
              </div>
            </div>
            <div className="highlight-pill">
              <Award size={16} className="highlight-icon blue-accent" />
              <div>
                <strong>Deloitte Cyber & Data Certified</strong>
                <span>2 Virtual Internships</span>
              </div>
            </div>
            <div className="highlight-pill">
              <GraduationCap size={16} className="highlight-icon green-accent" />
              <div>
                <strong>B.Tech CSE (CGPA: {portfolioData.cgpa})</strong>
                <span>2022 - 2026</span>
              </div>
            </div>
            <div className="highlight-pill">
              <Globe size={16} className="highlight-icon purple-accent" />
              <div>
                <strong>4 Live Deployed Projects</strong>
                <span>Render • Vercel • GitHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <main className="recruiter-document-body">
        {/* Section 1: About */}
        <section id="recruiter-about" className="recruiter-section">
          <AboutSection onExploreProjects={() => {
            document.getElementById('recruiter-projects')?.scrollIntoView({ behavior: 'smooth' });
          }} />
        </section>

        {/* Section 2: Skills */}
        <section id="recruiter-skills" className="recruiter-section">
          <SkillsSection />
        </section>

        {/* Section 3: Projects */}
        <section id="recruiter-projects" className="recruiter-section">
          <ProjectsSection />
        </section>

        {/* Section 4: Experience */}
        <section id="recruiter-experience" className="recruiter-section">
          <ExperienceSection />
        </section>

        {/* Section 5: Contact */}
        <section id="recruiter-contact" className="recruiter-section">
          <ContactSection />
        </section>
      </main>

      {/* Recruiter Footer */}
      <footer className="recruiter-footer">
        <p>© {new Date().getFullYear()} {portfolioData.name}. All projects live in production.</p>
        <div className="footer-links">
          <a href={portfolioData.github} target="_blank" rel="noreferrer">GitHub (lalit-1608)</a>
          <span>•</span>
          <a href={portfolioData.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <span>•</span>
          <a href={`mailto:${portfolioData.email}`}>Email</a>
        </div>
      </footer>
    </div>
  );
};
