// Project types
export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deploymentUrl?: string;
  code: {
    html: string;
    css: string;
    javascript: string;
    fullCode: string;
  };
};

// User types
export type User = {
  id: string;
  name: string;
  email: string;
  projects: Project[];
};

// Template types
export type Template = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  thumbnail: string;
  code: {
    html: string;
    css: string;
    javascript: string;
  };
};

// AI generation types
export type GenerationPrompt = {
  description: string;
  type: 'website' | 'webapp' | 'landing-page' | 'dashboard';
  features: string[];
  style: {
    colorScheme: string;
    layout: string;
  };
};

// Deployment types
export type DeploymentProvider = 'vercel' | 'netlify' | 'github-pages';

export type DeploymentConfig = {
  provider: DeploymentProvider;
  projectName: string;
  isPublic: boolean;
  customDomain?: string;
};

export type DeploymentStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export type Deployment = {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  url?: string;
  provider: DeploymentProvider;
  createdAt: string;
  completedAt?: string;
  error?: string;
}; 