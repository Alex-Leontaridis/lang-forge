import React, { useState } from 'react';
import { 
  MessageSquare, 
  User, 
  Bot, 
  Settings, 
  Trash2, 
  Clock,
  ChevronDown,
  ChevronUp,
  Brain
} from 'lucide-react';
import { ConversationMessage } from '../types';

interface ConversationHistoryProps {
  messages: ConversationMessage[];
  onClearHistory: () => void;
  onDeleteMessage: (index: number) => void;
  memoryEnabled: boolean;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ 
  messages, 
  onClearHistory, 
  onDeleteMessage,
  memoryEnabled 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'human':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'ai':
        return <Bot className="w-4 h-4 text-green-600" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'human':
        return 'User';
      case 'ai':
        return 'Assistant';
      case 'system':
        return 'System';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'human':
        return 'bg-blue-50 border-blue-200';
      case 'ai':
        return 'bg-green-50 border-green-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!memoryEnabled) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <Brain className="w-4 h-4" />
          <span className="text-sm">Memory is disabled. Enable memory to see conversation history.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-gray-700" />
            <div>
              <h3 className="font-semibold text-gray-900">Conversation History</h3>
              <p className="text-sm text-gray-600">
                {messages.length} message{messages.length !== 1 ? 's' : ''} in memory
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Clear all messages"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No conversation history yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a conversation to see messages here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${getRoleColor(message.role)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(message.role)}
                      <span className="text-sm font-medium text-gray-700">
                        {getRoleLabel(message.role)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                      <button
                        onClick={() => onDeleteMessage(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.metadata && Object.keys(message.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          Metadata
                        </summary>
                        <pre className="mt-1 text-gray-600 bg-white p-2 rounded border">
                          {JSON.stringify(message.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationHistory; 