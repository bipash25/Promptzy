import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { projectService, promptService } from '@promptzy/shared';
import {
  Menu,
  X,
  Plus,
  Search,
  Star,
  FolderPlus,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Archive,
  Filter,
  Moon,
  Sun,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    user,
    projects,
    prompts,
    selectedProject,
    showSidebar,
    selectProject,
    selectPrompt,
    toggleSidebar,
    loadProjects,
    loadPrompts,
    signOut,
    settings,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewPromptModal, setShowNewPromptModal] = useState(false);
  const [showProjectSelectModal, setShowProjectSelectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [newPromptProjectId, setNewPromptProjectId] = useState(null);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('updated_at');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    loadProjects();
    loadPrompts({ projectId: selectedProject });
  }, [selectedProject]);

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings]);

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !filterFavorites || p.favorite;
    return matchesSearch && matchesFavorite;
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await projectService.create({
        name: newProjectName,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      });
      await loadProjects();
      setNewProjectName('');
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const createPrompt = async () => {
    if (!newPromptTitle.trim()) return;
    
    // If no project selected and we have projects, show project selector
    if (!newPromptProjectId && projects.length > 0) {
      setShowProjectSelectModal(true);
      return;
    }
    
    try {
      const created = await promptService.create({
        project_id: newPromptProjectId || selectedProject,
        title: newPromptTitle,
        content: newPromptContent,
        tags: [],
      });
      await loadPrompts({ projectId: selectedProject });
      setNewPromptTitle('');
      setNewPromptContent('');
      setNewPromptProjectId(null);
      setShowNewPromptModal(false);
      setShowProjectSelectModal(false);
      navigate(`/editor/${created.id}`);
    } catch (error) {
      console.error('Failed to create prompt:', error);
      alert('Failed to create prompt. Please try again.');
    }
  };

  const openNewPromptModal = () => {
    setNewPromptProjectId(selectedProject);
    setShowNewPromptModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Promptzy
          </h1>
          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
        </div>

        <div className="p-3">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            <FolderPlus size={18} />
            <span className="text-sm">New Project</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => selectProject(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition ${
              !selectedProject
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span className="text-sm font-medium">All Prompts</span>
              <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                {prompts.length}
              </span>
            </div>
          </button>

          {projects.map((project) => (
            <div key={project.id}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setExpandedProjects((prev) => ({
                      ...prev,
                      [project.id]: !prev[project.id],
                    }))
                  }
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {expandedProjects[project.id] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                <button
                  onClick={() => selectProject(project.id)}
                  className={`flex-1 text-left px-2 py-2 rounded-lg transition ${
                    selectedProject === project.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} style={{ color: project.color }} />
                    <span className="text-sm font-medium truncate">{project.name}</span>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span className="text-sm">
              {theme === 'light' ? 'Dark' : 'Light'} Mode
            </span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-lg transition"
          >
            <LogOut size={16} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {showSidebar ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`p-2 rounded-lg transition ${
                filterFavorites
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Star size={20} fill={filterFavorites ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={openNewPromptModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              <Plus size={18} />
              <span className="text-sm">New Prompt</span>
            </button>
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {filteredPrompts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No prompts yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {selectedProject
                    ? 'Create your first prompt in this project'
                    : 'Select a project and create your first prompt'}
                </p>
                <button
                  onClick={openNewPromptModal}
                  className="btn-primary"
                >
                  <Plus size={18} className="inline mr-2" />
                  Create Prompt
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    onClick={() => navigate(`/editor/${prompt.id}`)}
                    className="card hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {prompt.title}
                      </h3>
                      {prompt.favorite && (
                        <Star size={16} className="text-yellow-500" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                      {prompt.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {new Date(prompt.updated_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{prompt.word_count} words</span>
                      {prompt.tags && prompt.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {prompt.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={openNewPromptModal}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 group"
          title="Create new prompt"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowNewProjectModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Create New Project</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="input mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createProject()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={createProject} className="btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Prompt Modal */}
      {showNewPromptModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowNewPromptModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[600px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Create New Prompt</h3>
            
            {/* Project selector */}
            {projects.length > 0 && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project (optional)
                </label>
                <select
                  value={newPromptProjectId || ''}
                  onChange={(e) => setNewPromptProjectId(e.target.value || null)}
                  className="input"
                >
                  <option value="">No project (Inbox)</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <input
              type="text"
              value={newPromptTitle}
              onChange={(e) => setNewPromptTitle(e.target.value)}
              placeholder="Prompt title"
              className="input mb-3"
              autoFocus
            />
            <textarea
              value={newPromptContent}
              onChange={(e) => setNewPromptContent(e.target.value)}
              placeholder="Write your prompt in markdown...

Use **bold**, *italic*, `code`, and more!
Template variables: {{variable_name}}"
              className="input h-48 mb-4 font-mono text-sm"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewPromptModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={createPrompt} className="btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Select Modal (shown when creating prompt without project) */}
      {showProjectSelectModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowProjectSelectModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Select a Project</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose which project to save this prompt to:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              <button
                onClick={() => {
                  setNewPromptProjectId(null);
                  setShowProjectSelectModal(false);
                  createPrompt();
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
              >
                <div className="font-medium">No Project (Inbox)</div>
                <div className="text-xs text-gray-500">Save without a project</div>
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setNewPromptProjectId(project.id);
                    setShowProjectSelectModal(false);
                    createPrompt();
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-medium">{project.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowProjectSelectModal(false)}
              className="w-full btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}