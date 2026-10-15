import React, { useState } from 'react';
import { Cpu, Code2, Server, Database, Wrench, CheckCircle } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import { sounds } from '../../audio/soundEffects';

export const SkillsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...portfolioData.skills.map((c) => c.category)];

  const filteredCategories =
    activeCategory === 'all'
      ? portfolioData.skills
      : portfolioData.skills.filter((c) => c.category === activeCategory);

  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('language')) return <Code2 size={18} />;
    if (lower.includes('front')) return <Cpu size={18} />;
    if (lower.includes('back')) return <Server size={18} />;
    if (lower.includes('database')) return <Database size={18} />;
    return <Wrench size={18} />;
  };

  return (
    <div className="destination-content skills-section">
      <div className="section-header-banner">
        <span className="section-eyebrow">DESTINATION 02 / TECH WORKSHOP</span>
        <h2 className="section-main-title">Engineering Tech Stack</h2>
        <p className="section-desc">
          Tools, languages, and frameworks I leverage to design robust full-stack applications and performant web products.
        </p>

        {/* Filter Tabs */}
        <div className="category-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick();
                setActiveCategory(cat);
              }}
            >
              {cat === 'all' ? 'All Skills' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Skills Grid */}
      <div className="skills-categories-list">
        {filteredCategories.map((catGroup, index) => (
          <div key={index} className="skill-category-card">
            <div className="category-header">
              <div className="category-icon-box">{getCategoryIcon(catGroup.category)}</div>
              <div>
                <h3 className="category-title">{catGroup.category}</h3>
                <p className="category-subtitle">{catGroup.description}</p>
              </div>
            </div>

            <div className="badges-grid">
              {catGroup.skills.map((skill, sIdx) => (
                <div
                  key={sIdx}
                  className={`skill-badge ${skill.featured ? 'featured' : ''}`}
                  title={`${skill.name} - ${catGroup.category}`}
                >
                  <div className="badge-bullet">
                    <CheckCircle size={14} className="bullet-icon" />
                  </div>
                  <span className="skill-name">{skill.name}</span>
                  {skill.featured && <span className="featured-pill">Core</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
