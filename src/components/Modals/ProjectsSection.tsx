import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, ChevronRight, X, Sparkles, Globe, Radio } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import type { ProjectItem } from '../../data/portfolio';
import { GithubIcon } from '../common/BrandIcons';
import { sounds } from '../../audio/soundEffects';

export const ProjectsSection: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  return (
    <div className="destination-content projects-section">
      <div className="section-header-banner">
        <div className="live-deployed-eyebrow">
          <span className="live-pulse-dot" />
          <span>ALL PROJECTS LIVE & DEPLOYED IN PRODUCTION</span>
        </div>
        <h2 className="section-main-title">Live Production Projects</h2>
        <p className="section-desc">
          Click any project to test the live web application on Render, Vercel, or GitHub Pages, or inspect the source architecture.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {portfolioData.projects.map((project) => (
          <div key={project.id} className="project-card featured-card">
            <div className="project-card-top">
              <div className="badge-and-meta">
                <span className="project-badge live-badge">
                  <Radio size={12} className="live-icon" />
                  {project.badge}
                </span>
                {project.featured && (
                  <span className="featured-star">
                    <Sparkles size={13} /> Deployed
                  </span>
                )}
              </div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-tagline">{project.tagline}</p>
            </div>

            <p className="project-desc-short">{project.description}</p>

            <div className="project-tech-tags">
              {project.technologies.slice(0, 5).map((tech, i) => (
                <span key={i} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>

            {/* Direct 1-Click Action Buttons for Recruiters */}
            <div className="project-action-row">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="live-demo-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                }}
              >
                <Globe size={14} />
                <span>Open Live App</span>
                <ExternalLink size={13} />
              </a>

              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="repo-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                }}
              >
                <GithubIcon size={14} />
                <span>Code</span>
              </a>

              <button
                className="details-btn"
                onClick={() => {
                  sounds.playClick();
                  setSelectedProject(project);
                }}
              >
                <span>Details</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Deep-Dive Modal */}
      {selectedProject && (
        <div className="project-detail-overlay animate-fade-in" onClick={() => setSelectedProject(null)}>
          <div
            className="project-detail-modal animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-modal-header">
              <div>
                <span className="project-badge live-badge">
                  <Radio size={12} className="live-icon" />
                  {selectedProject.badge}
                </span>
                <h3 className="detail-title">{selectedProject.title}</h3>
                <p className="detail-tagline">{selectedProject.tagline}</p>
              </div>
              <button
                className="close-detail-btn"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="detail-modal-body">
              {/* Problem Solved */}
              <div className="detail-block">
                <h4 className="detail-block-title">The Challenge & Problem Solved</h4>
                <p className="detail-text">{selectedProject.problemSolved}</p>
              </div>

              {/* My Contribution */}
              <div className="detail-block">
                <h4 className="detail-block-title">My Technical Contribution</h4>
                <p className="detail-text">{selectedProject.myContribution}</p>
              </div>

              {/* Key Features */}
              <div className="detail-block">
                <h4 className="detail-block-title">Key Engineering Features</h4>
                <div className="features-checklist">
                  {selectedProject.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <CheckCircle2 size={16} className="feature-check" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="detail-block">
                <h4 className="detail-block-title">Complete Technology Stack</h4>
                <div className="detail-tags-row">
                  {selectedProject.technologies.map((t, idx) => (
                    <span key={idx} className="detail-tech-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Links */}
            <div className="detail-modal-footer">
              <a
                href={selectedProject.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="primary-action-btn"
                onClick={() => sounds.playClick()}
              >
                <ExternalLink size={16} />
                <span>Launch Live Application</span>
              </a>

              <a
                href={selectedProject.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-action-btn"
                onClick={() => sounds.playClick()}
              >
                <GithubIcon size={16} />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
