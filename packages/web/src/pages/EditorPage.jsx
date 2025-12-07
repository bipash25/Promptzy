import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { promptService, markdownUtils } from '@promptzy/shared';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Save,
  Copy,
  Eye,
  Code,
  Maximize2,
  Minimize2,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
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
  const [zenMode, setZenMode] = useState(false);
  const [stats, setStats] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showChainEditor, setShowChainEditor] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  useEffect(() => {
    if (id === 'new') {
      setLoading(false);
      setPrompt({ title: '', content: '', tags: [] });
    } else {
      loadPrompt();
    }
  }, [id]);

  useEffect(() => {
    if (content) {
      setStats(markdownUtils.getStats(content));
    }
  }, [content]);

  useEffect(() => {
    if (prompt) {
      // Proper array comparison for tags
      const tagsChanged = tags.length !== (prompt.tags?.length || 0) ||
        tags.some((tag, i) => tag !== prompt.tags?.[i]);

      setHasChanges(
        title !== prompt.title ||
        content !== prompt.content ||
        tagsChanged
      );
    }
  }, [title, content, tags, prompt]);

  const loadPrompt = useCallback(async () => {
    try {
      const data = await promptService.getById(id);
      setPrompt(data);
      setTitle(data.title);
      setContent(data.content);
      setTags(data.tags || []);
    } catch (error) {
      console.error('Failed to load prompt:', error);
      // Navigate back on error
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleSave = async () => {
    if (!title.trim()) {
      // Prevent saving empty titles
      return;
    }

    setSaving(true);
    try {
      if (id === 'new') {
        const created = await promptService.create({ title, content, tags });
        navigate(`/editor/${created.id}`, { replace: true });
      } else {
        await promptService.update(id, { title, content, tags });
        await loadPrompt();
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save prompt. Please try again.');
    } finally {
      setSaving(false);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-screen bg-background transition-all duration-300", zenMode ? "fixed inset-0 z-50" : "")}>
      {/* Toolbar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (hasChanges) {
                if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  navigate('/');
                }
              } else {
                navigate('/');
              }
            }}
            aria-label="Go back to dashboard"
          >
            <ArrowLeft size={20} />
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none shadow-none focus-visible:ring-0 px-0 h-auto min-w-0"
            placeholder="Untitled Prompt"
          />
          {hasChanges && (
            <span className="text-xs text-orange-500 font-medium px-2 py-0.5 bg-orange-500/10 rounded-full shrink-0 flex items-center gap-1">
              <AlertTriangle size={12} />
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZenMode(!zenMode)}
            title={zenMode ? "Exit Zen Mode" : "Zen Mode"}
            aria-label={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
            aria-pressed={zenMode}
            className="hidden sm:flex"
          >
            {zenMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? "Hide Preview" : "Show Preview"}
            aria-label={showPreview ? "Hide Preview" : "Show Preview"}
            aria-pressed={showPreview}
          >
            {showPreview ? <Code size={18} /> : <Eye size={18} />}
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="min-w-[80px]"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={cn(
          "flex flex-col transition-all duration-300",
          showPreview ? "w-full md:w-1/2 border-r border-border" : "w-full max-w-3xl mx-auto"
        )}>
          {/* Tags & Stats Bar */}
          <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground overflow-x-auto">
            <div className="flex items-center gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-secondary rounded-full flex items-center gap-1">
                  #{tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive"><MoreVertical size={10} className="rotate-45" /></button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <label htmlFor="tag-input" className="sr-only">Add a tag</label>
                <input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="+ Tag"
                  aria-label="Add a tag"
                  className="bg-transparent border-none outline-none w-16 placeholder:text-muted-foreground/50 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span>{stats.words || 0} words</span>
              <span>{stats.characters || 0} chars</span>
            </div>
          </div>

          <textarea
            id="prompt-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full p-4 sm:p-6 bg-transparent border-none resize-none focus:outline-none font-mono text-sm leading-relaxed"
            placeholder="Start writing your prompt..."
            spellCheck={false}
            aria-label="Prompt content"
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="hidden md:block w-1/2 bg-muted/10 overflow-y-auto p-4 sm:p-8">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return inline ? (
                      <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code className="font-mono text-xs" {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  }
                }}
              >
                {content || '*Preview will appear here...*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

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