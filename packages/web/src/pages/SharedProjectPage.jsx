import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareService } from '@promptzy/shared';
import { Folder, FileText, Lock, AlertCircle, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading shared project...</p>
        </div>
      </div>
    );
  }

  if (needsPassword && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Password Required</h2>
          <p className="text-muted-foreground text-center mb-6">
            This project is protected. Enter the password to view.
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
              Unlock Project
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

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: project.color + '20' }}
            >
              <Folder size={24} style={{ color: project.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} • Shared via Promptzy
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {prompts.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">
              This project doesn't have any prompts yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Prompts List */}
            <nav className="md:col-span-1 space-y-3" aria-label="Prompts list">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Prompts in this project</h2>
              {prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  aria-pressed={selectedPrompt?.id === prompt.id}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedPrompt?.id === prompt.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="mt-1 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-foreground">{prompt.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {prompt.word_count} words
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Prompt Detail */}
            <section className="md:col-span-2" aria-label="Prompt content">
              {selectedPrompt ? (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-foreground">{selectedPrompt.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(selectedPrompt.content)}
                      aria-label={copySuccess ? "Copied!" : "Copy to clipboard"}
                      title="Copy to clipboard"
                    >
                      {copySuccess ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </Button>
                  </div>
                  <div className="p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                      {selectedPrompt.content}
                    </pre>
                    {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedPrompt.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border h-full min-h-[300px] flex items-center justify-center p-12 text-center">
                  <div>
                    <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
                    <p className="text-muted-foreground">
                      Select a prompt to view its content
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Want to create and share your own projects?
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