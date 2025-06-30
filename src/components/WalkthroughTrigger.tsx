import React, { useState } from 'react';
import { HelpCircle, X, Play, BookOpen } from 'lucide-react';
import { useWalkthrough } from '../contexts/WalkthroughContext';

const WalkthroughTrigger: React.FC = () => {
  const { 
    isActive, 
    startWalkthrough, 
    hasCompletedWalkthrough,
    isFirstTimeUser 
  } = useWalkthrough();
  const [isOpen, setIsOpen] = useState(false);

  const walkthroughs = [
    {
      id: 'dashboard',
      name: 'Dashboard Overview',
      description: 'Learn how to navigate and use the dashboard',
      icon: '📊'
    },
    {
      id: 'prompt-editor',
      name: 'Prompt Editor',
      description: 'Learn how to create and edit prompts',
      icon: '✏️'
    },
    {
      id: 'prompt-management',
      name: 'Prompt Management',
      description: 'Learn how to organize and manage multiple prompts',
      icon: '📁'
    },
    {
      id: 'analytics-features',
      name: 'Analytics & Testing',
      description: 'Learn about analytics and testing features',
      icon: '📈'
    },
    {
      id: 'canvas-overview',
      name: 'Visual Canvas',
      description: 'Learn about the visual prompt chain builder',
      icon: '🎨'
    }
  ];

  const handleStartWalkthrough = (walkthroughId: string) => {
    startWalkthrough(walkthroughId);
    setIsOpen(false);
  };

  if (isActive) return null;

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-40 group"
        title="Get help with walkthroughs"
      >
        <HelpCircle size={24} />
        {isFirstTimeUser && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            !
          </span>
        )}
      </button>

      {/* Walkthrough modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <BookOpen size={24} className="text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Interactive Walkthroughs</h2>
                  <p className="text-sm text-gray-500">Learn how to use PromptForge</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {isFirstTimeUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Welcome to PromptForge! 🎉</h3>
                  <p className="text-blue-800 text-sm">
                    We recommend starting with the Dashboard Overview to get familiar with the interface.
                  </p>
                </div>
              )}

              {walkthroughs.map((walkthrough) => {
                const isCompleted = hasCompletedWalkthrough(walkthrough.id);
                return (
                  <div
                    key={walkthrough.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{walkthrough.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{walkthrough.name}</h3>
                          {isCompleted && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{walkthrough.description}</p>
                        <button
                          onClick={() => handleStartWalkthrough(walkthrough.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Play size={16} />
                          {isCompleted ? 'Replay' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Walkthroughs are interactive guides that highlight features and guide you through the interface.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalkthroughTrigger; 