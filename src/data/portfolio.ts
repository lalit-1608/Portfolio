import type { Destination } from '../types/game';

export interface SkillItem {
  name: string;
  level?: string;
  featured?: boolean;
}

export interface SkillCategory {
  category: string;
  description: string;
  skills: SkillItem[];
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  problemSolved: string;
  myContribution: string;
  technologies: string[];
  features: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  badge: string;
  metrics?: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  organization: string;
  type: 'education' | 'experience' | 'milestone' | 'certification';
  duration?: string;
  description: string;
  highlights?: string[];
  credentialBadge?: string;
}

export interface PortfolioData {
  name: string;
  initials: string;
  role: string;
  tagline: string;
  availability: string;
  cgpa: string;
  bio: {
    summary: string;
    extended: string[];
    philosophy: string;
    interests: string[];
  };
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  socialLinks: {
    label: string;
    url: string;
    icon: string;
  }[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  timeline: TimelineItem[];
  destinations: Destination[];
}

export const portfolioData: PortfolioData = {
  name: 'Lalit Chauhan',
  initials: 'LC',
  role: 'Full-Stack Developer & Software Engineer',
  tagline: 'MERN Stack & Full-Stack Engineer with 6+ months internship experience, 4 live production apps, and CGPA 7.10.',
  availability: 'Actively Interviewing • Ready to Join Immediately',
  cgpa: '7.10',
  bio: {
    summary:
      'Results-driven Full-Stack Software Engineer with 6 months of industry experience at LebMentix, alongside internships at Prodigy InfoTech, TCS, and Deloitte (Cybersecurity & Data Analytics). B.Tech in CSE (CGPA 7.10). Proven track record of shipping 4+ live production web applications deployed on Render, Vercel, and GitHub Pages.',
    extended: [
      'My hands-on development experience centers on architecting scalable full-stack web applications using React.js, Node.js, Express, and MongoDB, complemented by strong algorithmic problem solving in Java and JavaScript.',
      'At LebMentix, I spent 6 months building and optimizing real-world full-stack web modules, implementing robust RESTful APIs, securing state management, and streamlining responsive client views.',
      'Further enriched by virtual training programs from Deloitte (Cybersecurity & Data Analytics), TCS, and Prodigy InfoTech, giving me a solid understanding of enterprise application security, clean code architecture, and agile product delivery.'
    ],
    philosophy:
      'Recruiters look for execution, speed, and real deployed work. I write clean, maintainable code, ship fast, and build software that genuinely solves problems.',
    interests: [
      'Production Full-Stack Architecture (MERN)',
      'Real-Time Web Applications & WebSockets',
      'Interactive 3D Web Graphics (Three.js / WebGL)',
      'API Security & Cryptographic Auth (JWT)',
      'Performance Optimization & Clean Code'
    ]
  },
  email: 'chauhanlalit1312@gmail.com',
  github: 'https://github.com/lalit-1608',
  linkedin: 'https://linkedin.com/in/lalitchauhan',
  resumeUrl: '/Lalit_Chauhan_Resume.pdf',
  socialLinks: [
    { label: 'GitHub', url: 'https://github.com/lalit-1608', icon: 'github' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/lalitchauhan', icon: 'linkedin' },
    { label: 'Email', url: 'mailto:chauhanlalit1312@gmail.com', icon: 'mail' }
  ],
  skills: [
    {
      category: 'Programming Languages',
      description: 'Core languages for scalable engineering and algorithms',
      skills: [
        { name: 'JavaScript (ES6+)', featured: true },
        { name: 'TypeScript', featured: true },
        { name: 'Java (Core, OOP, Collections)', featured: true },
        { name: 'Python', featured: true },
        { name: 'C / C++', featured: false },
        { name: 'HTML5 & Modern CSS3', featured: true }
      ]
    },
    {
      category: 'Frontend Engineering',
      description: 'Modern component frameworks, styling, and animations',
      skills: [
        { name: 'React.js', featured: true },
        { name: 'Next.js', featured: true },
        { name: 'Tailwind CSS', featured: true },
        { name: 'Vite', featured: true },
        { name: 'Three.js / WebGL', featured: true },
        { name: 'Redux Toolkit', featured: true },
        { name: 'Responsive Mobile UI/UX', featured: true },
        { name: 'HTML5 Canvas API', featured: false }
      ]
    },
    {
      category: 'Backend & APIs',
      description: 'Server architecture, RESTful services, and authentication',
      skills: [
        { name: 'Node.js', featured: true },
        { name: 'Express.js', featured: true },
        { name: 'RESTful API Architecture', featured: true },
        { name: 'JWT Authentication & Security', featured: true },
        { name: 'WebSockets (Socket.io)', featured: true },
        { name: 'Middleware & Error Handling', featured: true }
      ]
    },
    {
      category: 'Databases & Storage',
      description: 'NoSQL and SQL databases with optimized query design',
      skills: [
        { name: 'MongoDB (NoSQL)', featured: true },
        { name: 'Mongoose ODM', featured: true },
        { name: 'MySQL', featured: true },
        { name: 'PostgreSQL', featured: false },
        { name: 'Firebase', featured: false }
      ]
    },
    {
      category: 'Developer Tools & Cloud',
      description: 'DevOps, version control, and cloud hosting',
      skills: [
        { name: 'Git & GitHub', featured: true },
        { name: 'Postman API Testing', featured: true },
        { name: 'Vercel Deployment', featured: true },
        { name: 'Render Cloud Deployment', featured: true },
        { name: 'GitHub Pages CI/CD', featured: true },
        { name: 'VS Code & DevTools', featured: true }
      ]
    },
    {
      category: 'Core CS & Corporate Acumen',
      description: 'Academic foundation and corporate problem solving',
      skills: [
        { name: 'Data Structures & Algorithms', featured: true },
        { name: 'Object-Oriented Programming (OOP)', featured: true },
        { name: 'Cybersecurity Fundamentals (Deloitte)', featured: true },
        { name: 'Data Analytics & Visualization (Deloitte)', featured: true },
        { name: 'Agile Team Collaboration', featured: true }
      ]
    }
  ],
  projects: [
    {
      id: 'ai-habit-tracker',
      title: 'AI Habit Tracker & Analytics App',
      tagline: 'Intelligent daily habit coaching with streak velocity & predictive analytics',
      description:
        'A full-stack habit tracking web application deployed on Render. Features automated streak calculations, AI-driven consistency recommendations, and responsive analytics heatmaps.',
      problemSolved:
        'Solves the high drop-off rate of routine apps by providing dynamic AI feedback, consistency scoring, and milestone encouragement.',
      myContribution:
        'Engineered complete MERN stack architecture, normalized MongoDB schemas, dynamic streak logic, and responsive UI components.',
      technologies: ['React.js', 'Node.js', 'Express', 'MongoDB', 'AI API', 'Tailwind CSS', 'Render'],
      features: [
        'Live deployed on Render cloud platform',
        'Dynamic streak calculation algorithms & consistency graphs',
        'AI-driven habit recommendation engine',
        'Responsive mobile-friendly dashboard'
      ],
      liveUrl: 'https://ai-habit-tracker-app.onrender.com',
      githubUrl: 'https://github.com/lalit-1608',
      featured: true,
      badge: 'Production App (Render)',
      metrics: 'Live Production URL'
    },
    {
      id: 'faculty-pulse',
      title: 'FacultyPulse — Anonymous Review System',
      tagline: 'Institutional department review & anonymous faculty feedback portal',
      description:
        'An academic feedback platform live on Vercel. Enables verified students to submit encrypted, anonymous course evaluations, empowering department heads with actionable metric summaries.',
      problemSolved:
        'Eliminates student fear of bias, boosting honest academic feedback submission rates and streamlining department course reviews.',
      myContribution:
        'Architected Next.js/React frontend, secure survey routing, anonymous feedback pipelines, and faculty metric dashboard cards.',
      technologies: ['React.js', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'Vercel'],
      features: [
        'Live deployed on Vercel',
        'Cryptographic anonymous survey submission',
        'Role-based access & course rating aggregators',
        'Interactive administrative performance metrics'
      ],
      liveUrl: 'https://faculty-pulse-two.vercel.app',
      githubUrl: 'https://github.com/lalit-1608',
      featured: true,
      badge: 'Live on Vercel',
      metrics: 'Active Web Portal'
    },
    {
      id: 'flight-tracker',
      title: 'Global Flight Tracker & Radar',
      tagline: 'Real-time interactive aviation radar and live aircraft status tracker',
      description:
        'A flight monitoring web utility live on GitHub Pages. Connects with aviation data feeds to plot live flights, route paths, departure/arrival statuses, and airline metrics.',
      problemSolved:
        'Delivers zero-latency visual flight search without heavy airline bloatware, providing fast route and terminal info.',
      myContribution:
        'Implemented aviation API ingestion, coordinate plotting on interactive maps, debounced flight number search, and flight status cards.',
      technologies: ['JavaScript (ES6+)', 'Aviation APIs', 'HTML5 Canvas/Maps', 'CSS3', 'GitHub Pages'],
      features: [
        'Live deployed on GitHub Pages',
        'Instant flight code and route lookup',
        'Dynamic status tags (En Route, Scheduled, Landed)',
        'Zero external build dependencies'
      ],
      liveUrl: 'https://lalit-1608.github.io/Flight-Tracker/',
      githubUrl: 'https://github.com/lalit-1608/Flight-Tracker',
      featured: true,
      badge: 'Live on GitHub Pages',
      metrics: 'Live Aviation Radar'
    },
    {
      id: 'qr-code-generator',
      title: 'Ultimate QR Code Generator',
      tagline: 'Custom QR generator with live SVG/Canvas rendering and branding',
      description:
        'A fast client-side QR generation suite live on GitHub Pages. Allows instant customization of QR colors, logos, URLs, WiFi credentials, and high-res vector downloads.',
      problemSolved:
        'Replaces paywalled online QR tools with an unlimited, privacy-friendly generator that runs 100% in the user browser.',
      myContribution:
        'Engineered client-side canvas rendering, dynamic error-correction level selection, SVG serialization, and instant download hooks.',
      technologies: ['JavaScript', 'HTML5 Canvas API', 'CSS Grid', 'GitHub Pages'],
      features: [
        'Live deployed on GitHub Pages',
        'Zero server latency — 100% client-side privacy',
        'Color palette customization & PNG/SVG export',
        'Support for URL, Plain Text, WiFi & Contact cards'
      ],
      liveUrl: 'https://lalit-1608.github.io/Ultimate-QR-Code-Generator/',
      githubUrl: 'https://github.com/lalit-1608/Ultimate-QR-Code-Generator',
      featured: true,
      badge: 'Live Utility',
      metrics: '100% Client-Side Fast'
    }
  ],
  timeline: [
    {
      year: '2024 (6 Months)',
      title: 'Full-Stack Developer Intern',
      organization: 'LebMentix',
      type: 'experience',
      duration: '6 Months',
      credentialBadge: 'Industry Experience',
      description:
        'Contributed as a Full-Stack Software Developer Intern for 6 months. Developed and maintained responsive web applications, engineered RESTful API endpoints, integrated MongoDB database models, and optimized frontend client state.',
      highlights: [
        'Developed production-ready full-stack features using React, Node.js, and MongoDB',
        'Designed RESTful API endpoints with authentication and clean data validation',
        'Collaborated on code reviews, debugging, and cross-browser responsiveness'
      ]
    },
    {
      year: '2024 (1 Month)',
      title: 'Software Development Intern',
      organization: 'Prodigy InfoTech',
      type: 'experience',
      duration: '1 Month',
      credentialBadge: 'Internship',
      description:
        'Completed a software development internship focusing on building high-performance web applications, responsive user interfaces, and modular JavaScript components.',
      highlights: [
        'Built modern interactive web modules adhering to clean coding standards',
        'Strengthened component lifecycle and asynchronous event handling'
      ]
    },
    {
      year: '2024 (1 Month)',
      title: 'Technology & Software Engineering Program',
      organization: 'Tata Consultancy Services (TCS)',
      type: 'experience',
      duration: '1 Month',
      credentialBadge: 'Corporate Program',
      description:
        'Completed the TCS corporate learning program covering enterprise software development methodologies, agile workflows, and full-stack software practices.',
      highlights: [
        'Enterprise SDLC methodologies & agile team collaboration',
        'Hands-on problem solving and structured code deployment'
      ]
    },
    {
      year: '2024',
      title: 'Cybersecurity Virtual Internship',
      organization: 'Deloitte',
      type: 'certification',
      credentialBadge: 'Deloitte Certified',
      description:
        'Specialized virtual internship focusing on cyber threat assessment, network security measures, access control frameworks, and vulnerability detection.',
      highlights: [
        'Analyzed security postures and authentication threat vectors',
        'Applied risk mitigation and data protection protocols'
      ]
    },
    {
      year: '2024',
      title: 'Data Analytics Virtual Internship',
      organization: 'Deloitte',
      type: 'certification',
      credentialBadge: 'Deloitte Certified',
      description:
        'Completed comprehensive data analytics internship analyzing enterprise datasets, deriving business intelligence, and building visual metric dashboards.',
      highlights: [
        'Data cleaning, transformation, and statistical insight extraction',
        'Executive data storytelling and decision metrics visualization'
      ]
    },
    {
      year: '2022 - 2026',
      title: 'Bachelor of Technology — Computer Science & Engineering',
      organization: 'University Engineering Program',
      type: 'education',
      credentialBadge: 'CGPA: 7.10',
      description:
        'Pursuing Bachelor of Technology in Computer Science & Engineering with an academic CGPA of 7.10. Solid foundation in Data Structures, Algorithms, Object-Oriented Programming (Java/Python), Database Systems, and Web Technologies.',
      highlights: [
        'Academic CGPA: 7.10',
        'Core Courses: Data Structures, OOPs in Java, DBMS, Computer Networks, OS'
      ]
    }
  ],
  destinations: [
    {
      id: 'about',
      index: 0,
      title: 'My Home — About Me',
      subtitle: 'Candidate Snapshot & Bio',
      description: 'Lalit Chauhan — Full-Stack Developer (MERN), CGPA 7.10, 6-month intern at LebMentix.',
      roadDistance: 0.05,
      position: [0, 0.5, 0],
      color: '#EF4444',
      iconName: 'home'
    },
    {
      id: 'skills',
      index: 1,
      title: 'Skill Station — Tech Stack',
      subtitle: 'Production Engineering Toolkit',
      description: 'Languages (Java, JS, TS, Python), MERN Stack, Next.js, Databases, and DevOps tools.',
      roadDistance: 0.28,
      position: [45, 1.2, 55],
      color: '#2563EB',
      iconName: 'cpu'
    },
    {
      id: 'projects',
      index: 2,
      title: 'Project Island — Live Apps',
      subtitle: '4 Live Production Deployed Applications',
      description: 'AI Habit Tracker (Render), FacultyPulse (Vercel), Flight Tracker & QR Suite (GitHub Pages).',
      roadDistance: 0.52,
      position: [-55, 1.0, 75],
      color: '#EF4444',
      iconName: 'folder-git-2'
    },
    {
      id: 'experience',
      index: 3,
      title: 'Experience Mountain — Internships',
      subtitle: 'LebMentix (6 mo), Prodigy, TCS, Deloitte',
      description: '6-Month Full-Stack Intern, TCS Program, Deloitte Cyber & Data Analytics, B.Tech CGPA 7.10.',
      roadDistance: 0.76,
      position: [-50, 4.0, -45],
      color: '#2563EB',
      iconName: 'mountain'
    },
    {
      id: 'contact',
      index: 4,
      title: 'The Finish Line — Hire Me',
      subtitle: "Let's connect & build something extraordinary",
      description: 'Direct contact info, verified links (GitHub: lalit-1608, LinkedIn), and resume download.',
      roadDistance: 0.96,
      position: [35, 1.5, -50],
      color: '#EF4444',
      iconName: 'flag'
    }
  ]
};
