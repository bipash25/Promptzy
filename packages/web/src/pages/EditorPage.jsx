// packages/web/src/pages/EditorPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { promptService, markdownUtils, shareService } from '@promptzy/shared';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Save,
  Copy,
  Share2,
  Star,
  Trash2,
  Eye,
  Code,
  History,
  Link as LinkIcon,
  FileDown,
  AlertCircle,
  Tag,
  X,
} from 'lucide-react';
import PromptChainEditor from '../components/PromptChainEditor';
import VersionHistory from '../components/VersionHistory';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [stats, setStats] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showChainEditor, setShowChainEditor] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadPrompt();
  }, [id]);

  useEffect(() => {
    if (content) {
      const newStats = markdownUtils.getStats(content);
      setStats(newStats);
    }
  }, [content]);

  useEffect(() => {
    if (prompt) {
      setHasChanges(
        title !== prompt.title || 
        content !== prompt.content ||
        JSON.stringify(tags) !== JSON.stringify(prompt.tags)
      );
    }
  }, [title, content, tags, prompt]);

  const loadPrompt = async () => {
    try {
      const data = await promptService.getById(id);
      setPrompt(data);
      setTitle(data.title);
      setContent(data.content);
      setTags(data.tags || []);
    } catch (error) {
      console.error('Failed to load prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await promptService.update(id, { title, content, tags });
      setHasChanges(false);
      await loadPrompt();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleToggleFavorite = async () => {
    try {
      await promptService.toggleFavorite(id, prompt.favorite);
      await loadPrompt();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await promptService.delete(id);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete prompt');
      }
    }
  };

  const handleExport = async (format) => {
    try {
      const { shareService } = await import('@promptzy/shared');
      let blob;
      let filename;

      switch (format) {
        case 'json':
          blob = shareService.exportAsJSON(prompt);
          filename = `${prompt.title}.json`;
          break;
        case 'md':
          blob = shareService.exportAsMarkdown(prompt);
          filename = `${prompt.title}.md`;
          break;
        case 'txt':
          blob = shareService.exportAsText(prompt);
          filename = `${prompt.title}.txt`;
          break;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Editor */}
      <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-0 focus:outline-none focus:border-b-2 focus:border-blue-500"
              placeholder="Prompt title"
            />
            {hasChanges && (
              <span className="text-xs text-orange-500 flex items-center gap-1">
                <AlertCircle size={14} />
                Unsaved
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              <Save size={18} />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
            >
              <Copy size={18} />
              {copySuccess && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Star size={18} className={prompt?.favorite ? 'fill-yellow-400 text-yellow-400' : ''} />
            </button>
            <button
              onClick={() => setShowChainEditor(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Prompt Chaining"
            >
              <LinkIcon size={18} />
            </button>
            <button
              onClick={() => setShowVersionHistory(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Version History"
            >
              <History size={18} />
            </button>
            <div className="relative group">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <FileDown size={18} />
              </button>
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hidden group-hover:block z-10">
                <button onClick={() => handleExport('json')} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                  Export as JSON
                </button>
                <button onClick={() => handleExport('md')} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                  Export as Markdown
                </button>
                <button onClick={() => handleExport('txt')} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                  Export as Text
                </button>
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {showPreview ? <Code size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <span>{stats.words || 0} words</span>
          <span>•</span>
          <span>{stats.characters || 0} characters</span>
          <span>•</span>
          <span>{stats.tokens || 0} tokens</span>
          <span>•</span>
          <span>{stats.lines || 0} lines</span>
          {stats.variables && stats.variables.length > 0 && (
            <>
              <span>•</span>
              <span className="text-yellow-600 dark:text-yellow-400">
                {stats.variables.length} variable{stats.variables.length > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tags Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="input text-sm"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                Add
              </button>
            </div>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full bg-transparent border-0 focus:outline-none resize-none font-mono text-sm"
            placeholder="Write your prompt in markdown...

Use **bold**, *italic*, `code`, and more!

Template variables: {{variable_name}}"
          />
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="w-1/2 bg-white dark:bg-gray-800 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-li:text-base prose-code:text-sm prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-pre:dark:bg-gray-800">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    return inline ? (
                      <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm font-mono" {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  h1: ({children}) => <h1 className="text-3xl font-bold mt-6 mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-bold mt-5 mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
                  ul: ({children}) => <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>,
                  li: ({children}) => <li className="text-base">{children}</li>,
                  p: ({children}) => <p className="text-base my-3">{children}</p>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 dark:text-gray-300">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content || '*Preview will appear here...*'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showChainEditor && (
        <PromptChainEditor
          promptId={id}
          onClose={() => setShowChainEditor(false)}
        />
      )}
      
      {showVersionHistory && (
        <VersionHistory
          promptId={id}
          onClose={() => setShowVersionHistory(false)}
          onRevert={() => {
            loadPrompt();
            setShowVersionHistory(false);
          }}
        />
      )}
    </div>
  );
}