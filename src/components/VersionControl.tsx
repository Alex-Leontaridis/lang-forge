import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, Plus, Clock, MessageSquare, ChevronDown, ChevronRight, Search, Trash2, Copy, MoreVertical, Edit3, Check, X } from 'lucide-react';
import { PromptVersion } from '../types';

interface VersionControlProps {
  versions: PromptVersion[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
  onCreateVersion: (title: string, message: string) => void;
  onDeleteVersion?: (versionId: string) => void;
  onDuplicateVersion?: (versionId: string) => void;
  onUpdateVersion?: (versionId: string, updates: Partial<PromptVersion>) => void;
  selectedVersionsForComparison?: string[];
  onVersionSelectForComparison?: (versionId: string) => void;
}

const VersionControl: React.FC<VersionControlProps> = ({
  versions,
  currentVersionId,
  onVersionSelect,
  onCreateVersion,
  onDeleteVersion,
  onDuplicateVersion,
  onUpdateVersion,
  selectedVersionsForComparison = [],
  onVersionSelectForComparison
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null);
  const [editingVersion, setEditingVersion] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
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

  const handleStartEdit = (version: PromptVersion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVersion(version.id);
    setEditTitle(version.title);
    setEditMessage(version.message || '');
    setShowMenuFor(null);
  };

  const handleSaveEdit = (versionId: string) => {
    if (editTitle.trim() && onUpdateVersion) {
      onUpdateVersion(versionId, {
        title: editTitle.trim(),
        message: editMessage.trim()
      });
      setEditingVersion(null);
      setEditTitle('');
      setEditMessage('');
    }
  };

  const handleCancelEdit = () => {
    setEditingVersion(null);
    setEditTitle('');
    setEditMessage('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // For very recent versions (less than 1 hour), show exact time
    if (diffInMinutes < 60) {
      if (diffInMinutes < 1) {
        return 'just now';
      }
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    // For recent versions (less than 24 hours), show hours and time
    if (diffInHours < 24) {
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago at ${timeString}`;
    }
    
    // For older versions, show date and time
    if (diffInDays < 7) {
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago at ${timeString}`;
    }
    
    // For very old versions, show just the date
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

          {/* Comparison Selection Header */}
          {onVersionSelectForComparison && selectedVersionsForComparison.length > 0 && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedVersionsForComparison.length} version{selectedVersionsForComparison.length !== 1 ? 's' : ''} selected for comparison
                </span>
                <button
                  onClick={() => selectedVersionsForComparison.forEach(id => onVersionSelectForComparison(id))}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Comparison Instructions */}
          {onVersionSelectForComparison && selectedVersionsForComparison.length === 0 && (
            <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                💡 Click the circles next to versions to select them for comparison. View comparison in the right sidebar.
              </p>
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
            {filteredVersions.length === 0 && !searchTerm && (
              <div className="text-center py-8 text-gray-500">
                <GitBranch className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">No versions yet</p>
                <p className="text-xs">Create your first version to get started</p>
              </div>
            )}
            
            {filteredVersions.slice().reverse().map((version) => (
              <div
                key={version.id}
                className={`relative rounded-lg border transition-colors ${
                  version.id === currentVersionId
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  {/* Comparison Checkbox */}
                  {onVersionSelectForComparison && (
                    <input
                      type="checkbox"
                      checked={selectedVersionsForComparison.includes(version.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onVersionSelectForComparison(version.id);
                      }}
                      className="rounded border-gray-300 text-black focus:ring-black flex-shrink-0 mr-2 ml-3"
                    />
                  )}
                  
                  {/* Version Content */}
                  <div className="flex-1 p-3 pr-10">
                    {editingVersion === version.id ? (
                      // Edit Mode
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={`w-full p-1 border border-gray-300 rounded text-sm ${
                            version.id === currentVersionId 
                              ? 'bg-white text-black' 
                              : 'bg-white text-gray-900'
                          }`}
                          placeholder="Version title"
                        />
                        <textarea
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          className={`w-full p-1 border border-gray-300 rounded text-sm h-12 resize-none ${
                            version.id === currentVersionId 
                              ? 'bg-white text-black' 
                              : 'bg-white text-gray-900'
                          }`}
                          placeholder="Commit message (optional)"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(version.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <button
                        onClick={() => onVersionSelect(version.id)}
                        className="w-full text-left"
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
                    )}
                  </div>
                  
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
                        {onUpdateVersion && (
                          <button
                            onClick={(e) => handleStartEdit(version, e)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
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