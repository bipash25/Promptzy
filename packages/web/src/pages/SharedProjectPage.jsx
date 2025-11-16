import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareService } from '@promptzy/shared';
import { Folder, FileText, Lock, AlertCircle, Copy } from 'lucide-react';

export default function SharedProjectPage() {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadSharedProject();
  }, [token]);

  const loadSharedProject = async (pwd = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await shareService.getSharedProject(token, pwd || password);
      setProject(data.project);
      setPrompts(data.prompts);
      setNeedsPassword(false);
    } catch (err) {
      if (err.message.includes('password')) {
        setNeedsPassword(true);
        setError('This project is password protected');
      } else {
        setError(err.message || 'Failed to load shared project');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      loadSharedProject(password);
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared project...</p>
        </div>
      </div>
    );
  }

  if (needsPassword && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Password Required</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            This project is protected. Enter the password to view.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input"
              autoFocus
            />
            <button type="submit" className="w-full btn-primary">
              Unlock Project
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error && !needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Folder size={32} style={{ color: project.color }} />
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} • Shared via Promptzy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Prompts List */}
          <div className="md:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold mb-4">Prompts in this project</h2>
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => setSelectedPrompt(prompt)}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  selectedPrompt?.id === prompt.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText size={16} className="mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{prompt.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {prompt.word_count} words
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Prompt Detail */}
          <div className="md:col-span-2">
            {selectedPrompt ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{selectedPrompt.title}</h3>
                  <button
                    onClick={() => handleCopy(selectedPrompt.content)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
                  >
                    <Copy size={18} />
                    {copySuccess && (
                      <span className="absolute -top-8 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
                <div className="p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {selectedPrompt.content}
                  </pre>
                  {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedPrompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center p-12 text-center">
                <div>
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a prompt to view its content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to create and share your own projects?
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition font-medium"
          >
            Get Started with Promptzy
          </a>
        </div>
      </div>
    </div>
  );
}