import {
  Opportunity,
  ServiceItem,
  WorkshopEvent,
  SkillTrack,
  SkillPathway,
  LearningResource,
  TeamMember,
  Testimonial,
  FAQItem,
  PartnerPlaceholder,
} from '../types';

/**
 * CORE PILLARS & STATS
 * Only real metrics should be shown. When starting, displays verified operational pillars.
 */
export const IMPACT_STATS = {
  peopleReached: '0',
  peopleReachedLabel: 'Community Members',
  opportunitiesVerified: '0',
  opportunitiesVerifiedLabel: 'Verified Opportunities',
  onlineSessionsHosted: '0',
  onlineSessionsHostedLabel: 'Interactive Workshops',
  communitiesSupported: '36 States + FCT',
  communitiesSupportedLabel: 'Nationwide Remote Reach',
};

/**
 * OPPORTUNITY DIRECTORY
 * Kept clean and empty until verified opportunities are published via the Admin Console.
 */
export const OPPORTUNITIES: Opportunity[] = [];
export const MOCK_OPPORTUNITIES: Opportunity[] = [];

/**
 * DIGITAL SKILL PATHWAYS
 * Real, structured, practical digital learning pathways tailored for Nigerian conditions.
 */
export const SKILL_PATHWAYS: SkillPathway[] = [
  {
    id: 'web-app-dev',
    title: 'Web & App Development',
    description:
      'Build responsive, mobile-first websites and web applications tailored for Nigerian internet conditions and global client standards.',
    targetAudience: 'Students, career switchers, and aspiring frontend/full-stack developers.',
    toolsTaught: ['HTML5', 'Tailwind CSS', 'JavaScript', 'React', 'Git & GitHub', 'REST APIs'],
    learningMode: 'Self-Paced Guides + Weekend Live Code-Alongs',
    progression: 'Beginner to Intermediate (12 Weeks)',
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design & Product Design',
    description:
      'Master design thinking, wireframing, interactive prototyping, and building case studies that showcase your problem-solving process.',
    targetAudience: 'Creative individuals, self-taught designers, and visual artists.',
    toolsTaught: ['Figma', 'FigJam', 'Wireframing', 'Design Systems', 'Case Studies'],
    learningMode: 'Project-Based Cohort + Portfolio Critiques',
    progression: 'Beginner to Advanced (10 Weeks)',
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing & Content Creation',
    description:
      'Learn how to drive sales using WhatsApp Business funnels, Meta advertising, conversion copywriting, and viral short-form video creation.',
    targetAudience: 'Social media managers, small business owners, and content writers.',
    toolsTaught: ['Meta Ads Manager', 'WhatsApp Catalog', 'Canva', 'CapCut', 'Email Marketing'],
    learningMode: 'Practical Video Tutorials + Weekly Sales Challenges',
    progression: 'Beginner to Intermediate (8 Weeks)',
  },
  {
    id: 'freelance-remote',
    title: 'Freelancing & Remote Work Essentials',
    description:
      'How to land international clients on Upwork, write high-converting proposals, set up foreign currency accounts, and manage power/internet downtime.',
    targetAudience: 'Any skilled individual wanting to earn in foreign currencies from Nigeria.',
    toolsTaught: ['Upwork', 'Payoneer', 'Geegpay', 'Time Tracking', 'Client Pitching'],
    learningMode: 'Masterclass Series + Proposal Teardowns',
    progression: 'All Levels (4 Weeks)',
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis & Business Intelligence',
    description:
      'Transform raw business data into interactive dashboards, uncover actionable insights, and automate business reporting for managers.',
    targetAudience: 'Accounting, economics, STEM graduates, and analytical minds.',
    toolsTaught: ['Microsoft Excel', 'SQL Basics', 'Power BI Desktop', 'DAX Formulas'],
    learningMode: 'Hands-on Datasets + Capstone Project',
    progression: 'Beginner to Intermediate (10 Weeks)',
  },
  {
    id: 'ai-literacy',
    title: 'Practical Digital Productivity Tools',
    description:
      'Harness modern productivity software and automation platforms to optimize writing, research, and administrative business workflows.',
    targetAudience: 'Students, researchers, entrepreneurs, and busy professionals.',
    toolsTaught: ['Notion', 'Zapier', 'Google Workspace', 'Cloud Collaboration'],
    learningMode: 'Interactive Weekly Clinics + Real-World Walkthroughs',
    progression: 'Beginner Friendly (6 Weeks)',
  },
  {
    id: 'cybersecurity-cloud',
    title: 'Cybersecurity & Cloud Foundations',
    description:
      'Protect digital assets against fraud, understand network defenses, and prepare for globally recognized entry certifications (CompTIA / AWS).',
    targetAudience: 'IT enthusiasts, computer science students, and future system administrators.',
    toolsTaught: ['Wireshark', 'Linux Terminal', 'Cloud Fundamentals', 'Incident Response'],
    learningMode: 'Virtual Lab Environments + Study Cohorts',
    progression: 'Beginner to Intermediate (10 Weeks)',
  },
  {
    id: 'business-digitization',
    title: 'Entrepreneurship & Small Business Digitization',
    description:
      'Step-by-step guidance on digital bookkeeping, creating corporate profiles, accepting instant bank transfers, and pitching for grant funding.',
    targetAudience: 'Nigerian retail vendors, artisans, micro-manufacturers, and service agencies.',
    toolsTaught: ['Digital Invoicing', 'Google Business Profile', 'PDF Deck Design', 'WhatsApp CRM'],
    learningMode: 'SME Clinics + 1-on-1 Consultation',
    progression: 'Foundational (4 Weeks)',
  },
];

/**
 * SUPPORT SERVICES
 * Practical career support offerings with clear outcomes.
 */
export const SUPPORT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-cv',
    title: 'CV & Resume Modernization',
    tagline: 'Transform your CV for Nigerian & international recruiters',
    description:
      'A thorough, line-by-line review and rewrite of your curriculum vitae. We restructure your experience around measurable impact, optimize for Applicant Tracking Systems (ATS), and remove outdated conventions.',
    targetAudience: 'Recent graduates, NYSC corpers, and professionals transitioning into tech or corporate roles.',
    expectedOutcome: 'An ATS-compliant, 1-2 page professional CV in editable Word and PDF format with customized bullet points.',
    deliveryTime: '48 to 72 hours',
    priceNaira: 0,
    isFree: true,
    popular: true,
    badge: '100% Free Community Service',
  },
  {
    id: 'srv-portfolio',
    title: 'Digital Portfolio Development',
    tagline: 'Showcase your creative or technical work with confidence',
    description:
      'Hands-on guidance to structure, write, and present compelling project case studies on GitHub, Notion, Behance, or a custom personal domain that prove your skills to global clients.',
    targetAudience: 'UI/UX designers, web developers, data analysts, and freelance writers.',
    expectedOutcome: 'A polished digital portfolio featuring at least 3 deep-dive case studies with clear problem/solution breakdowns.',
    deliveryTime: '5 to 7 business days',
    priceNaira: 7500,
    isFree: false,
    popular: true,
    badge: 'Highly Requested',
  },
  {
    id: 'srv-linkedin',
    title: 'LinkedIn Profile Optimization',
    tagline: 'Get found by headhunters and international recruiters',
    description:
      'Audit and overhaul your LinkedIn headline, summary, work history, and skills endorsement section to rank higher in recruiter searches for remote and local vacancies.',
    targetAudience: 'Job seekers, consultants, and freelancers seeking high-ticket international contracts.',
    expectedOutcome: 'An optimized profile with targeted search keywords, a clear headline, and professional narrative.',
    deliveryTime: '3 to 5 business days',
    priceNaira: 5000,
    isFree: false,
  },
  {
    id: 'srv-website',
    title: 'Starter Website Setup for Small Businesses',
    tagline: 'Establish your professional online footprint in Nigeria',
    description:
      'We set up a responsive, fast-loading landing page or brochure website for your business with integrated WhatsApp click-to-chat, bank payment instructions, and Google Maps listing.',
    targetAudience: 'Micro-businesses, vendors, agency owners, and independent professionals.',
    expectedOutcome: 'A fully functional modern website connected to your domain with mobile optimization and contact forms.',
    deliveryTime: '7 to 10 business days',
    priceNaira: 35000,
    isFree: false,
    badge: 'SME Package',
  },
  {
    id: 'srv-pitchdeck',
    title: 'Business Profile & Grant Pitch Deck',
    tagline: 'Pitch for Nigerian & global grants with confidence',
    description:
      'Design of a structured, 10-slide investor or grant-application pitch deck highlighting your business problem, market size, traction, and financial projections.',
    targetAudience: 'Startups applying for TEF, USADF, Bank of Industry (BOI), or angel investments.',
    expectedOutcome: 'A presentation-ready pitch deck delivered in PDF and editable PowerPoint format.',
    deliveryTime: '5 to 7 business days',
    priceNaira: 25000,
    isFree: false,
  },
  {
    id: 'srv-interview',
    title: 'Mock Interview & Application Coaching',
    tagline: 'Practice with experienced reviewers before your big day',
    description:
      'A 45-minute live mock video interview session focusing on behavioral questions, salary negotiation, and presentation of past projects.',
    targetAudience: 'Candidates shortlisted for scholarships, fellowships, or competitive remote roles.',
    expectedOutcome: 'Written assessment notes with specific verbal coaching and confidence improvements.',
    deliveryTime: 'Scheduled by appointment',
    priceNaira: 0,
    isFree: true,
  },
];

/**
 * WORKSHOPS & MASTERCLASSES
 * Kept clean and empty until scheduled through the admin dashboard.
 */
export const UPCOMING_WORKSHOPS: WorkshopEvent[] = [];

/**
 * TESTIMONIALS
 * Kept clean and empty until real member stories are submitted and approved.
 */
export const TESTIMONIALS: Testimonial[] = [];

/**
 * TEAM MEMBERS
 * Kept clean and empty until official team profiles are published.
 */
export const TEAM_MEMBERS: TeamMember[] = [];

/**
 * PARTNERS
 * Kept clean and empty until official partnership agreements are finalized.
 */
export const PARTNER_PLACEHOLDERS: PartnerPlaceholder[] = [];

/**
 * FREQUENTLY ASKED QUESTIONS
 */
export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Is NaijaBridge completely free to use?',
    answer:
      'Yes, browsing verified opportunities, joining community channels, attending public workshops, and requesting free pro-bono CV reviews are 100% free.',
    category: 'General',
  },
  {
    id: 'faq-2',
    question: 'How does NaijaBridge verify opportunities to protect users from scams?',
    answer:
      'Every listing is screened by our editorial team against official company registries, institution domains, and credible boards. We enforce a strict zero-tolerance policy against any application or recruitment fees.',
    category: 'Opportunities',
  },
  {
    id: 'faq-3',
    question: 'How can I participate if I do not reside in Lagos or Abuja?',
    answer:
      'NaijaBridge is remote-first by design. Whether you reside in Kano, Calabar, Enugu, or Ibadan, you can access workshops online, connect on community groups, and apply for verified remote roles nationwide.',
    category: 'General',
  },
  {
    id: 'faq-4',
    question: 'How do paid support services work?',
    answer:
      'While essential career support is free, specialized services (such as custom business website setups or grant pitch decks) have transparent, subsidized fees that help sustain our community operations.',
    category: 'Services',
  },
  {
    id: 'faq-5',
    question: 'How can employers or institutions partner with NaijaBridge?',
    answer:
      'Employers can share verified openings directly with our talent network, and educational institutions can collaborate on youth empowerment initiatives via our contact and partnership desk.',
    category: 'Partners',
  },
];

export const FAQS = FAQ_ITEMS;
export const WORKSHOPS = UPCOMING_WORKSHOPS;
export const SERVICES = SUPPORT_SERVICES;
export const SKILL_TRACKS = SKILL_PATHWAYS;
