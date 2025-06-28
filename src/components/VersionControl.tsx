import React, { useState } from 'react';
import { GitBranch, Plus, Clock, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { PromptVersion } from '../types';

interface VersionControlProps {
  versions: PromptVersion[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
  onCreateVersion: (title: string, message: string) => void;
}

const VersionControl: React.FC<VersionControlProps> = ({
  versions,
  currentVersionId,
  onVersionSelect,
  onCreateVersion
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const handleCreateVersion = () => {
    if (newTitle.trim()) {
      onCreateVersion(newTitle.trim(), newMessage.trim());
      setNewTitle('');
      setNewMessage('');
      setShowCreateForm(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormatter('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 w-full text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <GitBranch className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-900">Version History</span>
          <span className="text-sm text-gray-500">({versions.length})</span>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors mb-4"
          >
            <Plus className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Create New Version</span>
          </button>

          {showCreateForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="text"
                placeholder="Version title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm"
              />
              <textarea
                placeholder="Commit message (optional)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm h-20 resize-none"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateVersion}
                  className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {versions.slice().reverse().map((version) => (
              <button
                key={version.id}
                onClick={() => onVersionSelect(version.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  version.id === currentVersionId
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{version.title}</span>
                  <div className="flex items-center space-x-1 text-xs opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(version.createdAt)}</span>
                  </div>
                </div>
                {version.message && (
                  <div className="flex items-start space-x-1 text-xs opacity-75">
                    <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{version.message}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionControl;