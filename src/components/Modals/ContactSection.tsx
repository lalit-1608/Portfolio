import React, { useState, useEffect } from 'react';
import { Mail, Download, Send, Check, Copy, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { portfolioData } from '../../data/portfolio';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons';
import { sounds } from '../../audio/soundEffects';

export const ContactSection: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Fire celebratory confetti on mount
  useEffect(() => {
    sounds.playFinishFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#7CCBFF', '#123B72', '#FFFFFF', '#60A5FA']
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(portfolioData.email);
    setCopiedEmail(true);
    sounds.playClick();
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playFinishFanfare();
    setFormSent(true);
  };

  return (
    <div className="destination-content contact-section">
      {/* Celebration Finish Banner */}
      <div className="finish-banner">
        <div className="finish-icon-wrapper">
          <Trophy size={28} className="trophy-icon" />
        </div>
        <div className="finish-banner-text">
          <span className="finish-tag">DESTINATION 05 / THE FINISH LINE</span>
          <h2 className="finish-title">Let's build something extraordinary.</h2>
          <p className="finish-sub">
            Have an idea, an opportunity, or a project in mind? Let's connect.
          </p>
        </div>
      </div>

      <div className="contact-grid">
        {/* Left Column: Direct Links & Resume */}
        <div className="contact-info-col">
          <div className="content-card contact-card">
            <h3 className="card-block-title">Direct Connection</h3>
            <p className="card-block-desc">
              Feel free to reach out directly via email or explore my open-source code and professional profile.
            </p>

            {/* Email with copy button */}
            <div className="email-copy-box">
              <div className="email-display">
                <Mail size={18} className="email-icon" />
                <span className="email-string">{portfolioData.email}</span>
              </div>
              <button
                className={`copy-btn ${copiedEmail ? 'copied' : ''}`}
                onClick={handleCopyEmail}
                title="Copy email to clipboard"
              >
                {copiedEmail ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Links Row */}
            <div className="social-links-list">
              <a
                href={portfolioData.github}
                target="_blank"
                rel="noreferrer"
                className="social-link-btn github"
                onClick={() => sounds.playClick()}
              >
                <GithubIcon size={18} />
                <span>GitHub Profile</span>
              </a>

              <a
                href={portfolioData.linkedin}
                target="_blank"
                rel="noreferrer"
                className="social-link-btn linkedin"
                onClick={() => sounds.playClick()}
              >
                <LinkedinIcon size={18} />
                <span>LinkedIn Profile</span>
              </a>

              <a
                href={portfolioData.resumeUrl}
                download="Lalit_Chauhan_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn resume"
                onClick={() => sounds.playClick()}
              >
                <Download size={18} />
                <span>Download Resume (PDF)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Send Message Form */}
        <div className="contact-form-col">
          <div className="content-card form-card">
            <h3 className="card-block-title">Send a Direct Message</h3>
            <p className="card-block-desc">
              Drop a note below and I will get back to you promptly.
            </p>

            {formSent ? (
              <div className="form-success-alert animate-fade-in">
                <Sparkles size={24} className="sparkle-icon" />
                <h4>Message Received!</h4>
                <p>
                  Thank you for reaching out, {formData.name || 'there'}! I appreciate you exploring my world and will respond shortly.
                </p>
                <button
                  className="secondary-action-btn mt-3"
                  onClick={() => {
                    setFormSent(false);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Your Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. jane@company.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Hello Lalit, I would love to discuss a project..."
                    className="form-input form-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="primary-action-btn submit-btn">
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
