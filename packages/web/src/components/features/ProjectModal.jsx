import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Check, Palette } from 'lucide-react';
import { projectService } from '@promptzy/shared';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { useToast } from '../ui/Toast';

// Predefined colors for projects
const PROJECT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

export default function ProjectModal({ 
  open, 
  onOpenChange, 
  project = null, // If provided, we're editing
  parentId = null, // For creating sub-projects
  onSuccess 
}) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!project;

  // Reset form when opening or when project changes
  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name || '');
        setColor(project.color || '#3b82f6');
      } else {
        setName('');
        setColor('#3b82f6');
      }
      setError('');
    }
  }, [open, project]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a project name.');
      return;
    }

    if (name.trim().length > 50) {
      setError('Project name must be 50 characters or less.');
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate names
      const isDuplicate = await projectService.checkDuplicate(name.trim(), parentId);
      if (isDuplicate && (!isEditing || name.trim() !== project?.name)) {
        setError('A project with this name already exists.');
        setLoading(false);
        return;
      }

      if (isEditing) {
        await projectService.update(project.id, {
          name: name.trim(),
          color,
        });
        toast.success('Project updated successfully!');
      } else {
        await projectService.create({
          name: name.trim(),
          color,
          parent_id: parentId,
        });
        toast.success('Project created successfully!');
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error('Project save error:', err);
      setError(err.message || 'Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Folder size={20} style={{ color }} />
                </div>
                <h2 id="project-modal-title" className="text-xl font-semibold">
                  {isEditing ? 'Edit Project' : 'Create Project'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Project Name */}
              <div className="space-y-2">
                <label htmlFor="project-name" className="text-sm font-medium">
                  Project Name
                </label>
                <Input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="h-12"
                  autoFocus
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {name.length}/50
                </p>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette size={16} className="text-muted-foreground" />
                  Project Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center',
                        color === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: c, ringColor: c }}
                      aria-label={`Select color ${c}`}
                      aria-pressed={color === c}
                    >
                      {color === c && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Folder size={20} style={{ color }} />
                  </div>
                  <span className="font-medium">
                    {name.trim() || 'Project Name'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !name.trim()}
                >
                  {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}