import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareService, markdownUtils } from '@promptzy/shared';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Eye, Code, Lock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading shared prompt...</p>
        </div>
      </div>
    );
  }

  if (needsPassword && !prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Password Required</h2>
          <p className="text-muted-foreground text-center mb-6">
            This prompt is protected. Enter the password to view.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              aria-label="Password"
            />
            <Button type="submit" variant="gradient" className="w-full">
              Unlock Prompt
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (error && !needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 text-center border border-border">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-destructive" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{prompt.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Shared via Promptzy
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="relative"
                aria-label={copySuccess ? "Copied!" : "Copy to clipboard"}
                title="Copy to clipboard"
              >
                {copySuccess ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
                aria-label={showPreview ? "Show raw code" : "Show preview"}
                title={showPreview ? "Show raw code" : "Show preview"}
              >
                {showPreview ? <Code size={20} /> : <Eye size={20} />}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span>{stats.words || 0} words</span>
            <span className="hidden sm:inline">•</span>
            <span>{stats.characters || 0} characters</span>
            <span className="hidden sm:inline">•</span>
            <span>{stats.tokens || 0} tokens</span>
            {stats.variables && stats.variables.length > 0 && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  {stats.variables.length} variable{stats.variables.length > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
          {showPreview ? (
            <div className="prose dark:prose-invert max-w-none p-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {prompt.content}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="p-8 overflow-x-auto bg-muted/50">
              <code className="text-sm font-mono text-foreground">{prompt.content}</code>
            </pre>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Want to organize your own prompts?
          </p>
          <Button
            variant="gradient"
            size="lg"
            asChild
          >
            <a href="/signup" className="inline-flex items-center gap-2">
              Get Started with Promptzy
              <ExternalLink size={16} />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}