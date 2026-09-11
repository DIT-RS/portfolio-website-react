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
    period: 'Aug 2017 - Jul 2021',
    score: '79.9%',
  },
];

export const volunteerExperience = {
  organization: 'Make A Difference (MAD)',
  role: 'Volunteer',
  description:
    'Dedicated volunteer supporting education, tutoring, fund-raising, and mentorship programs for children in need of care and protection.',
};

export const defaultPortfolioContent: PortfolioContent = {
  bio: {
    heroTitle: 'I build things that work.',
    heroSubtitle:
      'Full-Stack & Cloud Developer based in Kerala, India. Specializing in Java, Spring Boot microservices, Angular/React, and AWS cloud engineering -- building scalable, high-throughput systems that deliver measurable business outcomes.',
    backgroundParagraphs: [
      'With over 4+ years of professional engineering experience across global enterprise leaders like IBM and Tata Consultancy Services (TCS), I specialize in architecting distributed backend services, cloud-native deployments, and modern front-end experiences.',
      'I have led cross-functional engineering teams, spearheaded large-scale legacy to cloud modernization initiatives (cutting operational costs by 40%), and engineered resilient messaging pipelines using Kafka and TIBCO EMS.',
      'Beyond enterprise engineering, I conducted computational thermodynamics research on carbon dioxide capture published in Springer Nature, and actively volunteer with NGOs to empower underprivileged children through education.',
    ],
  },
  contact: {
    email: 'dit.rs.ind@gmail.com',
    phone: '+91 97466 55205',
    location: 'Trivandrum & Kochi, Kerala, India',
    linkedin: 'https://linkedin.com/in/dit-rs/',
    github: 'https://github.com',
    responseTime: 'Within 24 hours',
    availabilityStatus: 'Open to Opportunities',
    availabilityDetail: 'Available for full-stack engineering, cloud architecture consulting, and technical collaboration.',
  },
  workPrinciples: [
    {
      number: '01',
      title: 'Clarity first',
      description:
        "I ask the hard questions upfront so we don't build the wrong thing. Clear requirements save weeks of rework.",
    },
    {
      number: '02',
      title: 'Ship fast, iterate',
      description:
        "I believe in getting working software in front of users quickly, then improving based on real feedback - not assumptions.",
    },
    {
      number: '03',
      title: 'Own the outcome',
      description:
        "I treat every project like it's my own. If something isn't working, I say so -- and I fix it.",
    },
    {
      number: '04',
      title: 'Write for humans',
      description:
        "Code is read far more than it's written. I write clean, documented, maintainable code that your future self will thank you for.",
    },
  ],
  skillCategories: [
    {
      title: 'Back-End & Microservices',
      skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'TIBCO EMS', 'JMS', 'REST APIs', 'Maven / Gradle', 'NoSQL', 'SQL'],
    },
    {
      title: 'Front-End',
      skills: ['Angular', 'React', 'TypeScript', 'JavaScript', 'MEAN Stack', 'MERN Stack', 'HTML5 / CSS3', 'Bootstrap', 'Tailwind CSS'],
    },
    {
      title: 'Cloud & DevOps',
      skills: ['AWS (ECS, SQS, S3, Lambda, CloudWatch)', 'Terraform', 'Docker', 'Jenkins (CI/CD)', 'Azure VMSS / Service Bus', 'Git / Bitbucket', 'Tomcat'],
    },
    {
      title: 'Data, Security & Tools',
      skills: ['PostgreSQL', 'SQL Server', 'Synopsys (Black Duck, Seeker)', 'Postman', 'DBeaver', 'Tableau', 'Informatica', 'Linux / Putty', 'Prompt Engineering'],
    },
  ],
  experiences: [
    {
      company: 'IBM',
      role: 'Application Developer',
      period: 'Aug 2025 - Present',
      location: 'Kochi, Kerala, India',
      client: "Freedom Mortgage (Oct '25 - Present)",
      points: [
        'Conducted technical feasibility analysis, effort estimation, and migration planning for transitioning PDF processing from iText to Datalogics, including core code refactoring.',
        'Built a proof-of-concept sample project and authored reference architecture documentation/code to accelerate smooth adoption across engineering teams.',
        'Contributed to core microservices using Java, Spring Boot, and Angular -- implementing high-throughput features and maintaining production services.',
        'Engineered cloud infrastructure using Terraform scripts and AWS cloud-native services including SQS, ECS, S3, Lambda, and CloudWatch for building, deploying, and real-time monitoring.',
      ],
      techStack: ['Java', 'Spring Boot', 'Angular', 'AWS (SQS, ECS, S3, Lambda, CloudWatch)', 'Terraform', 'Datalogics'],
    },
    {
      company: 'TATA Consultancy Services (TCS)',
      role: 'Java Full Stack Developer (Systems Engineer)',
      period: 'Jul 2021 - Aug 2025',
      location: 'Trivandrum, Kerala, India',
      points: [
        'Led an engineering team of 5 developers, spearheading the design, development, and delivery of enterprise full-stack web applications with strong back-end focus.',
        'Modernized and migrated monolithic workloads to cloud architecture, cutting operational overhead by ~40% and boosting overall system throughput by 15%.',
        'Engineered secure systems by resolving critical security vulnerabilities using Synopsys tools (Black Duck and Seeker).',
        'Integrated enterprise messaging backbones (Apache Kafka, TIBCO EMS, Azure Service Bus) for asynchronous inter-service communication and event-driven architectures.',
        'Built automated CI/CD deployment pipelines using Jenkins and Docker on Azure VMSS, drastically shortening release lead times.',
      ],
      techStack: ['Java', 'Spring Boot', 'Microservices', 'React', 'Angular', 'Kafka', 'TIBCO EMS', 'PostgreSQL', 'SQL Server', 'Docker', 'Azure VMSS', 'Jenkins'],
    },
  ],
  featuredProjects: [
    {
      id: 'enterprise-ecommerce-platform',
      title: 'Enterprise E-Commerce Platform',
      category: 'Full-Stack',
      categoryColor: 'amber',
      year: '2024',
      isFeatured: true,
      subtitle: 'High-performance storefront and microservices backend with role-based order tracking',
      description:
        'Built a complete end-to-end e-commerce platform featuring an event-driven Java & Spring Boot microservices backend paired with a dynamic MEAN/React front-end. Includes token-based JWT authentication, custom order pipeline, administrative management console, and automated inventory sync with PostgreSQL.',
      tags: ['Java', 'Spring Boot', 'Microservices', 'MEAN / React', 'PostgreSQL', 'JWT', 'Docker'],
      clientText: 'Production Application',
      repoText: 'Private Repo',
      isPrivate: true,
    },
    {
      id: 'cloud-pdf-processing-migration',
      title: 'High-Volume PDF Engine Migration',
      category: 'Enterprise / Cloud',
      categoryColor: 'blue',
      year: '2025',
      isFeatured: true,
      subtitle: 'Transitioning enterprise mortgage document rendering from iText to Datalogics on AWS',
      description:
        'Spearheaded the technical feasibility, architectural redesign, and POC for replacing legacy iText PDF rendering with Datalogics. Automated cloud provisioning via Terraform and integrated AWS SQS & ECS workers for distributed document processing under high concurrent load.',
      tags: ['Java', 'Spring Boot', 'AWS (SQS, ECS, S3)', 'Terraform', 'Datalogics', 'Angular'],
      clientText: 'IBM / Freedom Mortgage',
      repoText: 'Enterprise Codebase',
      isPrivate: true,
    },
  ],
  moreProjects: [
    {
      id: 'kafka-messaging-gateway',
      title: 'Event-Driven Messaging Backbone',
      category: 'Messaging / Infra',
      categoryColor: 'indigo',
      year: '2024',
      subtitle: 'Distributed messaging system with Apache Kafka, TIBCO EMS & Azure Service Bus',
      description:
        'Architected resilient asynchronous messaging conduits enabling seamless inter-application communication, high message durability, and distributed transaction handling across disparate enterprise services.',
      tags: ['Apache Kafka', 'TIBCO EMS', 'Azure Service Bus', 'Spring Boot', 'Docker'],
      clientText: 'TCS Enterprise Systems',
      isPrivate: true,
    },
    {
      id: 'employee-management-system',
      title: 'Employee Management Application',
      category: 'Full-Stack',
      categoryColor: 'purple',
      year: '2023',
      subtitle: 'Role-based workforce management and tracking system built with MERN stack',
      description:
        'Full-stack management solution with hierarchical role permissions, comprehensive employee directory, department budgeting, performance audits, and RESTful API back-end.',
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
      clientText: 'Self Project',
      isPrivate: true,
    },
    {
      id: 'dynamic-task-reminder-app',
      title: 'Task & Reminder Engine',
      category: 'Productivity',
      categoryColor: 'emerald',
      year: '2023',
      subtitle: 'Dynamic background workflow and notification scheduler with Angular & Spring Boot',
      description:
        'Task management platform with automated background cron schedulers, dynamic real-time theme shifts, and custom email/in-app notification alerts for mission-critical deadlines.',
      tags: ['Angular', 'Spring Boot', 'Java', 'JMS', 'PostgreSQL'],
      clientText: 'Self Project',
      isPrivate: true,
    },
    {
      id: 'ic-engine-carbon-capture-research',
      title: 'Molecular Dynamics Carbon Capture Research',
      category: 'Research / AI',
      categoryColor: 'blue',
      year: '2021',
      subtitle: 'Published Springer Nature paper: CO2 emission reduction using Zeolites with OpenMD',
      description:
        'Conducted computational research on carbon dioxide emission reduction in internal combustion engines using ZSM-5 Zeolites. Formulated complex simulation models using Python and the OpenMD molecular dynamics engine. Published under Springer Nature.',
      tags: ['Python', 'OpenMD', 'Data Analysis', 'Springer Nature'],
      clientText: 'Springer Nature Publication',
      publication: {
        publisher: 'Springer Nature',
        book: 'Advances in Multidisciplinary Analysis and Optimization',
        chapter: 'Molecular Dynamics of Carbon Capture from the Emissions of an IC Engine Using ZSM-5',
      },
      isPrivate: false,
    },
  ],
  certifications: [
    {
      title: 'Angular Developer Certification (Grade A)',
      issuer: 'Edureka',
      detail: 'Comprehensive frontend development with Angular framework',
    },
    {
      title: 'Digital: AWS Cloud Computing Intermediate',
      issuer: 'TCS Certification',
      detail: 'Cloud architecture, provisioning and serverless deployments on AWS',
    },
    {
      title: 'Wings: Core Tech T1 Building Modern Web Apps at Scale',
      issuer: 'TCS Certification',
      detail: 'Enterprise architecture, high-load microservices, and modern web application scaling',
    },
    {
      title: 'Wings: Core Tech Data Engineering & Data Visualization',
      issuer: 'TCS Certification',
      detail: 'Data transformation, analytics pipelines, and visualization architectures',
    },
    {
      title: 'Java Data Structures & Algorithms + LeetCode Exercises',
      issuer: 'Udemy (Scott Barrett)',
    },
    {
      title: 'The Complete Angular Course: Beginner to Advanced',
      issuer: 'Udemy (Mosh Hamedani)',
    },
  ],
  resumeUrl: '/Dit_R_S_resume.pdf',
};
