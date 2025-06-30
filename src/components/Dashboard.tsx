import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  Download, 
  Trash2, 
  Edit3, 
  Eye,
  BarChart3,
  FileText,
  Zap,
  Users,
  TrendingUp,
  Clock,
  FolderOpen,
  Sparkles,
  Layers,
  Workflow,
  MessageSquare,
  Bot,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Types for the dashboard
interface Project {
  id: string;
  title: string;
  description: string;
  lastUpdated: Date;
  status: 'Draft' | 'Testing' | 'Exported';
  exportType: 'SequentialChain' | 'LangGraph' | 'Custom' | 'None';
  promptCount: number;
  versionCount: number;
  totalTokens: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'LangChain' | 'LangGraph' | 'Chat' | 'Tools' | 'QA' | 'Summarizer';
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  preview: string;
}

interface Analytics {
  totalProjects: number;
  totalPromptVersions: number;
  totalTokensThisMonth: number;
  topPerformingPrompt: {
    title: string;
    score: number;
  };
  mostUsedModel: {
    name: string;
    usage: number;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalProjects: 0,
    totalPromptVersions: 0,
    totalTokensThisMonth: 0,
    topPerformingPrompt: { title: '', score: 0 },
    mostUsedModel: { name: '', usage: 0 }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    type: 'blank' as 'blank' | 'template' | 'import'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Mock data - in real app this would come from API
  useEffect(() => {
    // Initialize with empty data - in real app this would come from API
    setProjects([]);
    setTemplates([]);
    setAnalytics({
      totalProjects: 0,
      totalPromptVersions: 0,
      totalTokensThisMonth: 0,
      topPerformingPrompt: { title: '', score: 0 },
      mostUsedModel: { name: '', usage: 0 }
    });
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = () => {
    if (newProjectData.name.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        title: newProjectData.name,
        description: 'New project created from dashboard',
        lastUpdated: new Date(),
        status: 'Draft',
        exportType: 'None',
        promptCount: 0,
        versionCount: 0,
        totalTokens: 0
      };
      setProjects(prev => [newProject, ...prev]);
      setShowNewProjectModal(false);
      setNewProjectData({ name: '', type: 'blank' });
      
      // Navigate to the app with the new project
      navigate('/app', { state: { projectId: newProject.id } });
    }
  };

  const handleLoadTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setNewProjectData(prev => ({ ...prev, type: 'template' }));
    setShowNewProjectModal(true);
  };

  const handleOpenProject = (projectId: string) => {
    navigate('/app', { state: { projectId } });
  };

  const handleDuplicateProject = (project: Project) => {
    const duplicatedProject: Project = {
      ...project,
      id: Date.now().toString(),
      title: `${project.title} (Copy)`,
      lastUpdated: new Date(),
      status: 'Draft'
    };
    setProjects(prev => [duplicatedProject, ...prev]);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Testing': return 'bg-blue-100 text-blue-700';
      case 'Exported': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getExportTypeIcon = (type: string) => {
    switch (type) {
      case 'SequentialChain': return <Layers className="w-4 h-4" />;
      case 'LangGraph': return <Workflow className="w-4 h-4" />;
      case 'Custom': return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-semibold text-black">🦜 LangForge</span>
              <div className="hidden md:flex items-center space-x-6">
                <span className="text-gray-600">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app')}
                className="text-gray-600 hover:text-black transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={signOut}
                className="text-gray-600 hover:text-black transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Analytics Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-black">{analytics.totalProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prompt Versions</p>
                <p className="text-2xl font-bold text-black">{analytics.totalPromptVersions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tokens This Month</p>
                <p className="text-2xl font-bold text-black">{analytics.totalTokensThisMonth.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Prompt Score</p>
                <p className="text-2xl font-bold text-black">{analytics.topPerformingPrompt.score}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Most Used Model</p>
                <p className="text-lg font-bold text-black">{analytics.mostUsedModel.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black">Projects</h2>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Testing">Testing</option>
                  <option value="Exported">Exported</option>
                </select>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-black">{project.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          {project.exportType !== 'None' && (
                            <div className="flex items-center space-x-1 text-gray-500">
                              {getExportTypeIcon(project.exportType)}
                              <span className="text-xs">{project.exportType}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Updated {project.lastUpdated.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span>{project.promptCount} prompts</span>
                            <span>{project.versionCount} versions</span>
                            <span>{project.totalTokens.toLocaleString()} tokens</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenProject(project.id)}
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Open"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProject(project)}
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No projects found</p>
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
                    >
                      Create your first project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-black mb-6">Templates</h2>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-black mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.complexity === 'Beginner' ? 'bg-green-100 text-green-700' :
                            template.complexity === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {template.complexity}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {template.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{template.preview}</p>
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="w-full bg-gray-100 text-black px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                    >
                      Load Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-black mb-4">
              {newProjectData.type === 'template' && selectedTemplate ? `Create from ${selectedTemplate.name}` : 'Create New Project'}
            </h3>
            
            {newProjectData.type === 'template' && selectedTemplate && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={newProjectData.name}
                onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectData.name.trim()}
                className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 