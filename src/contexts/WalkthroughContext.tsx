import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'type' | 'scroll' | 'wait';
  actionText?: string;
  actionValue?: string;
  required?: boolean;
  skipIfHidden?: boolean;
}

export interface WalkthroughConfig {
  id: string;
  name: string;
  description: string;
  steps: WalkthroughStep[];
  route: string;
}

interface WalkthroughContextType {
  isActive: boolean;
  currentStep: number;
  currentWalkthrough: WalkthroughConfig | null;
  startWalkthrough: (walkthroughId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipWalkthrough: () => void;
  completeWalkthrough: () => void;
  isFirstTimeUser: boolean;
  hasCompletedWalkthrough: (walkthroughId: string) => boolean;
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export const useWalkthrough = () => {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
};

// Define all walkthrough configurations
const WALKTHROUGH_CONFIGS: WalkthroughConfig[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Overview',
    description: 'Learn how to navigate and use the dashboard',
    route: '/dashboard',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to PromptForge!',
        description: 'Let\'s take a quick tour of your dashboard to get you started.',
        target: '.dashboard-header',
        position: 'center',
        action: 'wait'
      },
      {
        id: 'create-project',
        title: 'Create Your First Project',
        description: 'Click the "New Project" button to start building your first prompt.',
        target: '[data-walkthrough="create-project"]',
        position: 'bottom',
        action: 'click',
        actionText: 'Click New Project'
      },
      {
        id: 'project-list',
        title: 'Your Projects',
        description: 'Here you can see all your projects. Each project can contain multiple prompts and versions.',
        target: '[data-walkthrough="project-list"]',
        position: 'top',
        action: 'wait'
      },
      {
        id: 'search-filter',
        title: 'Search and Filter',
        description: 'Use the search bar to find specific projects and filter by status.',
        target: '[data-walkthrough="search-filter"]',
        position: 'bottom',
        action: 'wait'
      },
      {
        id: 'analytics',
        title: 'Analytics Overview',
        description: 'Track your usage, performance, and insights across all your projects.',
        target: '[data-walkthrough="analytics"]',
        position: 'top',
        action: 'wait'
      },
      {
        id: 'templates',
        title: 'Templates',
        description: 'Browse pre-built templates to jumpstart your prompt development.',
        target: '[data-walkthrough="templates"]',
        position: 'top',
        action: 'wait'
      }
    ]
  },
  {
    id: 'prompt-editor',
    name: 'Prompt Editor',
    description: 'Learn how to create and edit prompts',
    route: '/app',
    steps: [
      {
        id: 'editor-welcome',
        title: 'Prompt Editor',
        description: 'This is where you\'ll create and refine your prompts. Let\'s explore the key features.',
        target: '[data-walkthrough="editor-main"]',
        position: 'center',
        action: 'wait'
      },
      {
        id: 'prompt-input',
        title: 'Write Your Prompt',
        description: 'Type your prompt here. You can use variables by wrapping them in {{curly braces}}.',
        target: '[data-walkthrough="prompt-input"]',
        position: 'top',
        action: 'type',
        actionText: 'Try typing a prompt',
        actionValue: 'Write a {{tone}} email to {{recipient}} about {{topic}}'
      },
      {
        id: 'variables-panel',
        title: 'Variables Panel',
        description: 'Define variables that can be used in your prompts. Click "Add Variable" to create one.',
        target: '[data-walkthrough="variables-panel"]',
        position: 'left',
        action: 'click',
        actionText: 'Add Variable'
      },
      {
        id: 'model-selection',
        title: 'Choose Your Model',
        description: 'Select which AI model to use for your prompt. Different models have different capabilities.',
        target: '[data-walkthrough="model-selection"]',
        position: 'bottom',
        action: 'wait'
      },
      {
        id: 'run-button',
        title: 'Test Your Prompt',
        description: 'Click "Run" to test your prompt with the selected model.',
        target: '[data-walkthrough="run-button"]',
        position: 'bottom',
        action: 'click',
        actionText: 'Run Prompt'
      },
      {
        id: 'output-panel',
        title: 'View Results',
        description: 'See the AI\'s response here. You can compare different versions and models.',
        target: '[data-walkthrough="output-panel"]',
        position: 'right',
        action: 'wait'
      }
    ]
  },
  {
    id: 'prompt-management',
    name: 'Prompt Management',
    description: 'Learn how to organize and manage multiple prompts',
    route: '/app',
    steps: [
      {
        id: 'prompt-list',
        title: 'Prompt List',
        description: 'Manage multiple prompts in your project. Each prompt can have multiple versions.',
        target: '[data-walkthrough="prompt-list"]',
        position: 'left',
        action: 'wait'
      },
      {
        id: 'create-prompt',
        title: 'Create New Prompt',
        description: 'Click the "+" button to create a new prompt in your project.',
        target: '[data-walkthrough="create-prompt"]',
        position: 'left',
        action: 'click',
        actionText: 'Create Prompt'
      },
      {
        id: 'version-control',
        title: 'Version Control',
        description: 'Each prompt can have multiple versions. Track changes and compare different iterations.',
        target: '[data-walkthrough="version-control"]',
        position: 'left',
        action: 'wait'
      },
      {
        id: 'prompt-actions',
        title: 'Prompt Actions',
        description: 'Duplicate, delete, or rename prompts using the menu options.',
        target: '[data-walkthrough="prompt-actions"]',
        position: 'left',
        action: 'wait'
      }
    ]
  },
  {
    id: 'analytics-features',
    name: 'Analytics & Testing',
    description: 'Learn about analytics and testing features',
    route: '/app',
    steps: [
      {
        id: 'analytics-tab',
        title: 'Analytics Tab',
        description: 'Switch to the Analytics tab to see detailed insights about your prompts.',
        target: '[data-walkthrough="analytics-tab"]',
        position: 'top',
        action: 'click',
        actionText: 'Go to Analytics'
      },
      {
        id: 'prompt-scoring',
        title: 'Prompt Scoring',
        description: 'Get automated scores for your prompts based on clarity, specificity, and other metrics.',
        target: '[data-walkthrough="prompt-scoring"]',
        position: 'center',
        action: 'wait'
      },
      {
        id: 'multi-model-testing',
        title: 'Multi-Model Testing',
        description: 'Test your prompt across multiple AI models to compare performance.',
        target: '[data-walkthrough="multi-model-testing"]',
        position: 'center',
        action: 'wait'
      },
      {
        id: 'auto-testing',
        title: 'Auto Testing',
        description: 'Automatically test your prompts with various inputs to ensure reliability.',
        target: '[data-walkthrough="auto-testing"]',
        position: 'center',
        action: 'wait'
      }
    ]
  },
  {
    id: 'canvas-overview',
    name: 'Visual Canvas',
    description: 'Learn about the visual prompt chain builder',
    route: '/canvas',
    steps: [
      {
        id: 'canvas-welcome',
        title: 'Visual Canvas',
        description: 'Build complex prompt chains visually by connecting nodes together.',
        target: '[data-walkthrough="canvas-main"]',
        position: 'center',
        action: 'wait'
      },
      {
        id: 'add-node',
        title: 'Add Nodes',
        description: 'Click the "+" button to add new prompt nodes to your canvas.',
        target: '[data-walkthrough="add-node"]',
        position: 'top',
        action: 'click',
        actionText: 'Add Node'
      },
      {
        id: 'connect-nodes',
        title: 'Connect Nodes',
        description: 'Drag from one node\'s output to another node\'s input to create connections.',
        target: '[data-walkthrough="connect-nodes"]',
        position: 'center',
        action: 'wait'
      },
      {
        id: 'node-editing',
        title: 'Edit Nodes',
        description: 'Double-click on nodes to edit their content and properties.',
        target: '[data-walkthrough="node-editing"]',
        position: 'center',
        action: 'wait'
      },
      {
        id: 'run-chain',
        title: 'Run Chain',
        description: 'Execute your entire prompt chain to see the final result.',
        target: '[data-walkthrough="run-chain"]',
        position: 'bottom',
        action: 'wait'
      }
    ]
  }
];

export const WalkthroughProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentWalkthrough, setCurrentWalkthrough] = useState<WalkthroughConfig | null>(null);
  const [completedWalkthroughs, setCompletedWalkthroughs] = useState<string[]>([]);

  // Load completed walkthroughs from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`walkthrough_completed_${user.id}`);
      if (saved) {
        setCompletedWalkthroughs(JSON.parse(saved));
      }
    }
  }, [user]);

  // Check if user is first time user
  const isFirstTimeUser = Boolean(user && completedWalkthroughs.length === 0);

  // Auto-start dashboard walkthrough for first-time users
  useEffect(() => {
    if (isFirstTimeUser && !isActive && window.location.pathname === '/dashboard') {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        startWalkthrough('dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstTimeUser, isActive]);

  const startWalkthrough = (walkthroughId: string) => {
    const walkthrough = WALKTHROUGH_CONFIGS.find(w => w.id === walkthroughId);
    if (walkthrough) {
      setCurrentWalkthrough(walkthrough);
      setCurrentStep(0);
      setIsActive(true);
    }
  };

  const nextStep = () => {
    if (currentWalkthrough && currentStep < currentWalkthrough.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeWalkthrough();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipWalkthrough = () => {
    setIsActive(false);
    setCurrentWalkthrough(null);
    setCurrentStep(0);
  };

  const completeWalkthrough = () => {
    if (currentWalkthrough && user) {
      const newCompleted = [...completedWalkthroughs, currentWalkthrough.id];
      setCompletedWalkthroughs(newCompleted);
      localStorage.setItem(`walkthrough_completed_${user.id}`, JSON.stringify(newCompleted));
    }
    setIsActive(false);
    setCurrentWalkthrough(null);
    setCurrentStep(0);
  };

  const hasCompletedWalkthrough = (walkthroughId: string) => {
    return completedWalkthroughs.includes(walkthroughId);
  };

  const value = {
    isActive,
    currentStep,
    currentWalkthrough,
    startWalkthrough,
    nextStep,
    previousStep,
    skipWalkthrough,
    completeWalkthrough,
    isFirstTimeUser,
    hasCompletedWalkthrough
  };

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  );
}; 