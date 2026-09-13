import portfolioData from './portfolio-data.json';

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  responseTime: string;
  availabilityStatus: string;
  availabilityDetail: string;
}

export interface WorkPrinciple {
  number: string;
  title: string;
  description: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  client?: string;
  points: string[];
  techStack: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  categoryColor: string; // e.g. blue, amber, purple, emerald, indigo
  year: string;
  isFeatured?: boolean;
  subtitle: string;
  description: string;
  tags: string[];
  clientText?: string;
  repoText?: string;
  isPrivate?: boolean;
  publication?: {
    publisher: string;
    book: string;
    chapter: string;
  };
}

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  score: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  detail?: string;
}

export interface PortfolioContent {
  bio: {
    heroTitle: string;
    heroSubtitle: string;
    backgroundParagraphs: string[];
  };
  contact: ContactInfo;
  workPrinciples: WorkPrinciple[];
  skillCategories: SkillCategory[];
  experiences: ExperienceItem[];
  featuredProjects: Project[];
  moreProjects: Project[];
  certifications: CertificationItem[];
  resumeUrl: string;
}

export const educationList: EducationItem[] = [
  {
    institution: 'Mar Baselios College of Engineering & Technology (Autonomous)',
    degree: 'B.Tech in Mechanical Engineering',
    period: 'Aug 2017 – Jul 2021',
    score: '79.9%',
  },
];

export const volunteerExperience = {
  organization: 'Make A Difference (MAD)',
  role: 'Volunteer',
  description:
    'Dedicated volunteer supporting education, tutoring, fund-raising, and mentorship programs for children in need of care and protection.',
};

export const defaultPortfolioContent: PortfolioContent =
  portfolioData satisfies PortfolioContent;
