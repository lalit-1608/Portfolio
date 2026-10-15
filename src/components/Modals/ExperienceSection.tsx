import React from 'react';
import { GraduationCap, Briefcase, Award, Milestone, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import type { TimelineItem } from '../../data/portfolio';

export const ExperienceSection: React.FC = () => {
  const getTimelineIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'education':
        return <GraduationCap size={18} />;
      case 'experience':
        return <Briefcase size={18} />;
      case 'certification':
        return <Award size={18} />;
      default:
        return <Milestone size={18} />;
    }
  };

  const getBadgeClass = (type: TimelineItem['type']) => {
    switch (type) {
      case 'education':
        return 'type-education';
      case 'experience':
        return 'type-experience';
      case 'certification':
        return 'type-cert';
      default:
        return 'type-milestone';
    }
  };

  return (
    <div className="destination-content experience-section">
      <div className="section-header-banner">
        <span className="section-eyebrow">DESTINATION 04 / EXPERIENCE MOUNTAIN</span>
        <h2 className="section-main-title">Professional & Academic Journey</h2>
        <p className="section-desc">
          Verified corporate internships, technology learning programs, certifications, and engineering education.
        </p>
      </div>

      {/* Mountain Trail Timeline */}
      <div className="mountain-trail-timeline">
        {portfolioData.timeline.map((item, index) => (
          <div key={index} className="trail-node">
            <div className="trail-marker">
              <div className="marker-icon-bubble">{getTimelineIcon(item.type)}</div>
              {index < portfolioData.timeline.length - 1 && <div className="trail-line" />}
            </div>

            <div className="trail-card">
              <div className="trail-card-header">
                <div className="trail-year-badge">
                  <Calendar size={13} />
                  <span>{item.year}</span>
                </div>
                <div className="trail-badge-group">
                  {item.credentialBadge && (
                    <span className="credential-pill">
                      <ShieldCheck size={12} />
                      {item.credentialBadge}
                    </span>
                  )}
                  <span className={`trail-type-pill ${getBadgeClass(item.type)}`}>
                    {item.type.toUpperCase()}
                  </span>
                </div>
              </div>

              <h3 className="trail-title">{item.title}</h3>
              <h4 className="trail-org">{item.organization}</h4>
              <p className="trail-desc">{item.description}</p>

              {item.highlights && item.highlights.length > 0 && (
                <div className="trail-highlights">
                  {item.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="highlight-row">
                      <CheckCircle size={14} className="highlight-check" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
