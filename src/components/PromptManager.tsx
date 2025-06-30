import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  X, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  MoreVertical, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Tag,
  Clock
} from 'lucide-react';
import { Prompt } from '../types';

interface PromptManagerProps {
  projectId?: string;
  prompts: Prompt[];
  currentPromptId?: string;
  onPromptSelect: (promptId: string) => void;
  onCreatePrompt: (title: string, description?: string) => void;
  onDeletePrompt?: (promptId: string) => void;
  onDuplicatePrompt?: (promptId: string) => void;
  onUpdatePrompt?: (promptId: string, updates: Partial<Prompt>) => void;
  collapsible?: boolean;
}

const PromptManager: React.FC<PromptManagerProps> = ({
  projectId,
  prompts,
  currentPromptId,
  onPromptSelect,
  onCreatePrompt,
  onDeletePrompt,
  onDuplicatePrompt,
  onUpdatePrompt,
  collapsible = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
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

  const handleCreatePrompt = () => {
    if (newTitle.trim()) {
      onCreatePrompt(newTitle.trim(), newDescription.trim());
      setNewTitle('');
      setNewDescription('');
      setShowCreateForm(false);
    }
  };

  const handleDeletePrompt = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeletePrompt && prompts.length > 1) {
      onDeletePrompt(promptId);
    }
    setShowMenuFor(null);
  };

  const handleDuplicatePrompt = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicatePrompt) {
      onDuplicatePrompt(promptId);
    }
    setShowMenuFor(null);
  };

  const handleStartEdit = (prompt: Prompt, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPrompt(prompt.id);
    setEditTitle(prompt.title);
    setEditDescription(prompt.description || '');
    setShowMenuFor(null);
  };

  const handleSaveEdit = (promptId: string) => {
    if (editTitle.trim() && onUpdatePrompt) {
      onUpdatePrompt(promptId, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setEditingPrompt(null);
      setEditTitle('');
      setEditDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setEditTitle('');
    setEditDescription('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      if (diffInMinutes < 1) {
        return 'just now';
      }
      return `${diffInMinutes}m ago`;
    }
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return '📧';
      case 'content': return '📝';
      case 'code': return '💻';
      case 'analysis': return '📊';
      case 'creative': return '🎨';
      default: return '📄';
    }
  };

  const filteredPrompts = prompts.filter(prompt =>
    searchTerm === '' || 
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: 'email', label: 'Email', icon: '��' },
    { value: 'content', label: 'Content', icon: '📝' },
    { value: 'code', label: 'Code', icon: '💻' },
    { value: 'analysis', label: 'Analysis', icon: '📊' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'other', label: 'Other', icon: '📄' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <button
          onClick={() => collapsible && setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 w-full text-left"
        >
          {collapsible && (isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />)}
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          <span className="font-semibold text-gray-900 text-sm sm:text-base">Prompts</span>
          <span className="text-xs sm:text-sm text-gray-500">({prompts.length})</span>
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors mb-4 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Create New Prompt</span>
          </button>

          {showCreateForm && (
            <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="text"
                placeholder="Prompt title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm"
              />
              <textarea
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-sm h-16 resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCreatePrompt}
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
          {prompts.length > 3 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredPrompts.length === 0 && !searchTerm && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">No prompts yet</p>
                <p className="text-xs">Create your first prompt to get started</p>
              </div>
            )}
            
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`relative rounded-lg border transition-colors ${
                  prompt.id === currentPromptId
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  {/* Prompt Content */}
                  <div className="flex-1 p-3 pr-10">
                    {editingPrompt === prompt.id ? (
                      // Edit Mode
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={`w-full p-1 border border-gray-300 rounded text-sm ${
                            prompt.id === currentPromptId 
                              ? 'bg-white text-black' 
                              : 'bg-white text-gray-900'
                          }`}
                          placeholder="Prompt title"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className={`w-full p-1 border border-gray-300 rounded text-sm h-12 resize-none ${
                            prompt.id === currentPromptId 
                              ? 'bg-white text-black' 
                              : 'bg-white text-gray-900'
                          }`}
                          placeholder="Description (optional)"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onUpdatePrompt && onUpdatePrompt(prompt.id, { title: editTitle, description: editDescription })}
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
                        onClick={() => onPromptSelect(prompt.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{prompt.title}</span>
                        </div>
                        {prompt.description && (
                          <div className="flex items-start space-x-1 text-xs opacity-75">
                            <span className="line-clamp-2">{prompt.description}</span>
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Prompt Actions Menu */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2" ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenuFor(showMenuFor === prompt.id ? null : prompt.id);
                      }}
                      className={`p-1 rounded hover:bg-opacity-20 ${
                        prompt.id === currentPromptId 
                          ? 'hover:bg-white text-white' 
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                    
                    {showMenuFor === prompt.id && (
                      <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        {onUpdatePrompt && (
                          <button
                            onClick={(e) => handleStartEdit(prompt, e)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                        {onDuplicatePrompt && (
                          <button
                            onClick={(e) => handleDuplicatePrompt(prompt.id, e)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Duplicate</span>
                          </button>
                        )}
                        {onDeletePrompt && prompts.length > 1 && (
                          <button
                            onClick={(e) => handleDeletePrompt(prompt.id, e)}
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

          {filteredPrompts.length === 0 && searchTerm && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No prompts found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptManager; 