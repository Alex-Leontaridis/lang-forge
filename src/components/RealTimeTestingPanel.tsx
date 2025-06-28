import React, { useState } from 'react';
import { 
  Play, 
  Zap, 
  Clock, 
  Hash, 
  Code, 
  Activity,
  Sparkles,
  Target,
  ChevronRight
} from 'lucide-react';

interface RealTimeTestingPanelProps {
  selectedNode: any;
  onRunNode: (nodeId: string) => void;
  onRunChain: () => void;
  isRunning: boolean;
}

const RealTimeTestingPanel: React.FC<RealTimeTestingPanelProps> = ({
  selectedNode,
  onRunNode,
  onRunChain,
  isRunning
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'stats'>('output');

  if (!selectedNode) {
    return (
      <div className="w-96 bg-gradient-to-br from-gray-50 to-white border-l-2 border-gray-200 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Node</h3>
          <p className="text-gray-500">Choose a node to see real-time testing options</p>
        </div>
      </div>
    );
  }

  const mockStats = {
    tokens: 1247,
    latency: 2.3,
    cost: 0.0024,
    score: 8.7
  };

  const mockOutput = `**Analysis Complete**

Based on your prompt configuration, here's the generated response:

The marketing campaign should focus on three key pillars:
1. **Authenticity** - Genuine customer stories
2. **Innovation** - Cutting-edge product features  
3. **Community** - Building lasting relationships

Key metrics to track:
- Engagement rate: 4.2%
- Conversion rate: 2.8%
- Customer satisfaction: 94%

This approach will drive sustainable growth while maintaining brand integrity.`;

  const tabs = [
    { id: 'input' as const, label: 'Input', icon: Code },
    { id: 'output' as const, label: 'Output', icon: Sparkles },
    { id: 'stats' as const, label: 'Stats', icon: Activity }
  ];

  return (
    <div className="w-96 bg-gradient-to-br from-white to-gray-50 border-l-2 border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Testing</h2>
            <p className="text-gray-600">{selectedNode.data.title}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'input' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Node Input</span>
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {selectedNode.data.prompt || 'No prompt configured'}
                </pre>
              </div>
            </div>

            {selectedNode.data.variables && Object.keys(selectedNode.data.variables).length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Variables</h3>
                <div className="space-y-2">
                  {Object.entries(selectedNode.data.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <code className="text-sm font-mono text-blue-600">{key}</code>
                      <span className="text-sm text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'output' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Generated Output</span>
              </h3>
              
              {isRunning ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Generating response...</p>
                  </div>
                </div>
              ) : selectedNode.data.output ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedNode.data.output}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {mockOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Hash className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Tokens</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{mockStats.tokens}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Latency</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{mockStats.latency}s</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Score</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{mockStats.score}/10</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                    <span className="text-yellow-600 font-bold text-sm">$</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">Cost</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">${mockStats.cost}</div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Performance Trend</h3>
              <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chart visualization</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 space-y-3">
        <button
          onClick={() => onRunNode(selectedNode.id)}
          disabled={isRunning}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          <Play className={`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`} />
          <span>{isRunning ? 'Running Node...' : 'Run Node'}</span>
        </button>

        <button
          onClick={onRunChain}
          disabled={isRunning}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
          <span>Run Full Chain</span>
        </button>
      </div>
    </div>
  );
};

export default RealTimeTestingPanel;