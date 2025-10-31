export interface IntakeTemplate {
  id: string;
  name: string;
  fields: string[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: string[];
}

export interface StakeholderTemplate {
  id: string;
  name: string;
  roles: string[];
}

export interface TeamTemplate {
  id: string;
  name: string;
  roles: string[];
}

export interface Templates {
  intake: IntakeTemplate[];
  checklist: ChecklistTemplate[];
  stakeholder: StakeholderTemplate[];
  team: TeamTemplate[];
}

export const templates: Templates = {
  intake: [
    {
      id: 'tech-startup',
      name: 'Tech Startup - Seed Stage',
      fields: ['Company Name', 'Industry', 'Funding Stage', 'Team Size', 'Tech Stack', 'Primary Goal', 'Timeline', 'Budget Range']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Digital Transformation',
      fields: ['Company Name', 'Industry', 'Department', 'Stakeholder Count', 'Current Systems', 'Pain Points', 'Success Metrics', 'Compliance Requirements']
    },
    {
      id: 'smb',
      name: 'SMB Process Optimization',
      fields: ['Business Name', 'Industry', 'Team Size', 'Current Process', 'Bottlenecks', 'Desired Outcome', 'Timeline', 'Budget']
    },
    {
      id: 'product-launch',
      name: 'Product Launch',
      fields: ['Product Name', 'Target Market', 'Launch Date', 'Marketing Channels', 'Key Features', 'Competitors', 'Success Metrics']
    }
  ],
  checklist: [
    {
      id: 'software-dev',
      name: 'Software Development Kickoff',
      items: ['Sign SOW & Contracts', 'Setup GitHub/GitLab Access', 'Configure Dev Environment', 'Access to Staging/Prod', 'Review Tech Stack', 'Architecture Review', 'Setup CI/CD Pipeline', 'Security Audit', 'Kickoff Meeting', 'Sprint Planning']
    },
    {
      id: 'strategy',
      name: 'Strategy Consulting Engagement',
      items: ['Sign Engagement Letter', 'NDA Exchange', 'Access to Financial Data', 'Stakeholder Interviews Scheduled', 'Industry Research', 'Competitive Analysis', 'Initial Workshop', 'Define Success Metrics', 'Communication Plan', 'Reporting Cadence']
    },
    {
      id: 'design-sprint',
      name: 'Design Sprint Setup',
      items: ['Book Sprint Space', 'Invite Participants', 'Gather User Research', 'Define Challenge', 'Prep Materials', 'Setup Prototyping Tools', 'Schedule User Tests', 'Whiteboard Setup', 'Kickoff Presentation', 'Post-Sprint Roadmap']
    }
  ],
  stakeholder: [
    {
      id: 'startup-org',
      name: 'Startup Org Chart',
      roles: ['CEO/Founder', 'CTO/Tech Lead', 'Product Lead', 'Marketing Lead', 'Operations']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Matrix',
      roles: ['VP/Director', 'Department Head', 'Project Sponsor', 'Technical Lead', 'Business Analyst', 'End Users', 'IT/Security', 'Legal/Compliance']
    },
    {
      id: 'agency',
      name: 'Agency Structure',
      roles: ['Account Director', 'Creative Director', 'Project Manager', 'Lead Designer', 'Lead Developer', 'Copywriter', 'QA Lead']
    }
  ],
  team: [
    {
      id: 'dev-team',
      name: 'Dev Team',
      roles: ['Project Manager', 'Tech Lead', 'Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'QA Engineer']
    },
    {
      id: 'strategy-team',
      name: 'Strategy Team',
      roles: ['Lead Consultant', 'Senior Analyst', 'Research Analyst', 'Data Analyst', 'Project Coordinator']
    },
    {
      id: 'fullstack',
      name: 'Full-Stack Team',
      roles: ['Engagement Lead', 'Product Strategist', 'Lead Developer', 'Designer', 'Marketing Specialist', 'Ops Coordinator']
    }
  ]
};
