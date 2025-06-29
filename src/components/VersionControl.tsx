import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, Plus, Clock, MessageSquare, ChevronDown, ChevronRight, Search, Trash2, Copy, MoreVertical } from 'lucide-react';
import { PromptVersion } from '../types';

interface VersionControlProps {
  versions: PromptVersion[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
  onCreateVersion: (title: string, message: string) => void;
  onDeleteVersion?: (versionId: string) => void;
  onDuplicateVersion?: (versionId: string) => void;
}

const VersionControl: React.FC<VersionControlProps> = ({
  versions,
  currentVersionId,
  onVersionSelect,
  onCreateVersion,
  onDeleteVersion,
  onDuplicateVersion
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateVersion = () => {
    if (newTitle.trim()) {
      onCreateVersion(newTitle.trim(), newMessage.trim());
      setNewTitle('');
      setNewMessage('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteVersion = (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteVersion && versions.length > 1) {
      onDeleteVersion(versionId);
    }
    setShowMenuFor(null);
  };

  const handleDuplicateVersion = (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicateVersion) {
      onDuplicateVersion(versionId);
    }
    setShowMenuFor(null);
  };

  const formatDate = (date: Date) => {
    // Check if Intl.RelativeTimeFormat is available
    if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
      try {
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
          Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          'day'
        );
      } catch (error) {
        // Fall through to fallback implementation
      }
    }
    
    // Fallback implementation
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'today';
    } else if (diffInDays === -1) {
      return 'yesterday';
    } else if (diffInDays === 1) {
      return 'tomorrow';
    } else if (diffInDays < 0) {
      return `${Math.abs(diffInDays)} days ago`;
    } else {
      return `in ${diffInDays} days`;
    }
  };

  const filteredVersions = versions.filter(version =>
    searchTerm === '' || 
    version.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 w-full text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          <span className="font-semibold text-gray-900 text-sm sm:text-base">Version History</span>
          <span className="text-xs sm:text-sm text-gray-500">({versions.length})</span>
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors mb-4 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Create New Version</span>
          </button>

          {showCreateForm && (
            <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm h-16 sm:h-20 resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCreateVersion}
                  className="px-3 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800 flex-1 sm:flex-none"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 flex-1 sm:flex-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          {versions.length > 3 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search versions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredVersions.slice().reverse().map((version) => (
              <div
                key={version.id}
                className={`relative rounded-lg border transition-colors ${
                  version.id === currentVersionId
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <button
                  onClick={() => onVersionSelect(version.id)}
                  className="w-full text-left p-3 pr-10"
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
                
                {/* Version Actions Menu */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenuFor(showMenuFor === version.id ? null : version.id);
                    }}
                    className={`p-1 rounded hover:bg-opacity-20 ${
                      version.id === currentVersionId 
                        ? 'hover:bg-white text-white' 
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                  
                  {showMenuFor === version.id && (
                    <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      {onDuplicateVersion && (
                        <button
                          onClick={(e) => handleDuplicateVersion(version.id, e)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Duplicate</span>
                        </button>
                      )}
                      {onDeleteVersion && versions.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteVersion(version.id, e)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredVersions.length === 0 && searchTerm && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No versions found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VersionControl;