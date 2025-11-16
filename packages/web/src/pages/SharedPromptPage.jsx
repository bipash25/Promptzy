import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareService, markdownUtils } from '@promptzy/shared';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Eye, Code, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function SharedPromptPage() {
  const { token } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadSharedPrompt();
  }, [token]);

  useEffect(() => {
    if (prompt?.content) {
      const newStats = markdownUtils.getStats(prompt.content);
      setStats(newStats);
    }
  }, [prompt]);

  const loadSharedPrompt = async (pwd = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await shareService.getSharedPrompt(token, pwd || password);
      setPrompt(data);
      setNeedsPassword(false);
    } catch (err) {
      if (err.message.includes('password')) {
        setNeedsPassword(true);
        setError('This prompt is password protected');
      } else {
        setError(err.message || 'Failed to load shared prompt');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      loadSharedPrompt(password);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared prompt...</p>
        </div>
      </div>
    );
  }

  if (needsPassword && !prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Password Required</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            This prompt is protected. Enter the password to view.
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
              Unlock Prompt
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

  if (!prompt) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold">{prompt.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Shared via Promptzy
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
              >
                <Copy size={20} />
                {copySuccess && (
                  <span className="absolute -top-8 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Copied!
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {showPreview ? <Code size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{stats.words || 0} words</span>
            <span>•</span>
            <span>{stats.characters || 0} characters</span>
            <span>•</span>
            <span>{stats.tokens || 0} tokens</span>
            {stats.variables && stats.variables.length > 0 && (
              <>
                <span>•</span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  {stats.variables.length} variable{stats.variables.length > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {showPreview ? (
            <div className="prose dark:prose-invert max-w-none p-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {prompt.content}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="p-8 overflow-x-auto">
              <code className="text-sm font-mono">{prompt.content}</code>
            </pre>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to organize your own prompts?
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