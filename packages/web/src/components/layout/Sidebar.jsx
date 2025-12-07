import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { authService, settingsService } from '@promptzy/shared';
import {
    LayoutDashboard,
    Plus,
    Search,
    Settings,
    LogOut,
    Folder,
    Hash,
    ChevronRight,
    Sparkles,
    Moon,
    Sun,
    MoreHorizontal,
    Edit2,
    Trash2,
    Star
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectModal from '../features/ProjectModal';
import { ConfirmDialog, useConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { projectService } from '@promptzy/shared';

export default function Sidebar({ onClose }) {
    const navigate = useNavigate();
    const toast = useToast();
    const { user, projects, prompts, settings, signOut, selectProject, selectedProject, loadProjects } = useStore();
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [projectMenuOpen, setProjectMenuOpen] = useState(null);
    const { confirm, dialogProps, ConfirmDialog: ConfirmDialogComponent } = useConfirmDialog();

    // Get unique tags from prompts
    const uniqueTags = useMemo(() => {
        const tagsSet = new Set();
        prompts.forEach(p => {
            if (p.tags) {
                p.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet).sort().slice(0, 10); // Show top 10 tags
    }, [prompts]);

    const handleSignOut = async () => {
        const confirmed = await confirm({
            title: 'Sign Out',
            description: 'Are you sure you want to sign out?',
            variant: 'question',
            confirmText: 'Sign Out',
            cancelText: 'Cancel',
        });
        
        if (confirmed) {
            await signOut();
            navigate('/login');
        }
    };

    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        document.documentElement.classList.toggle('dark', newTheme);
        
        // Save to backend
        try {
            await settingsService.updateTheme(newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const handleCreateProject = () => {
        setEditingProject(null);
        setShowProjectModal(true);
    };

    const handleEditProject = (project, e) => {
        e.stopPropagation();
        setProjectMenuOpen(null);
        setEditingProject(project);
        setShowProjectModal(true);
    };

    const handleDeleteProject = async (project, e) => {
        e.stopPropagation();
        setProjectMenuOpen(null);
        
        const confirmed = await confirm({
            title: 'Delete Project',
            description: `Are you sure you want to delete "${project.name}"? This will also delete all prompts in this project.`,
            variant: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
        
        if (confirmed) {
            try {
                await projectService.delete(project.id);
                toast.success('Project deleted successfully');
                if (selectedProject === project.id) {
                    selectProject(null);
                }
                await loadProjects();
            } catch (error) {
                toast.error('Failed to delete project');
                console.error('Delete project error:', error);
            }
        }
    };

    const handleProjectSuccess = async () => {
        await loadProjects();
    };

    const NavItem = ({ to, icon: Icon, label, end = false }) => (
        <NavLink
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                        ? "bg-primary/10 text-primary font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                )
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 bg-primary/10 rounded-xl"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <Icon size={18} className={cn("relative z-10 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary")} />
                    <span className="relative z-10">{label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto relative z-10 opacity-50" />}
                </>
            )}
        </NavLink>
    );

    return (
        <div className="h-full flex flex-col glass-panel border-r border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-heading font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                            Promptzy
                        </h1>
                        <p className="text-xs text-muted-foreground">Pro Edition</p>
                    </div>
                </div>

                <Button
                    className="w-full justify-start gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                    size="lg"
                    onClick={() => {
                        navigate('/editor/new');
                        onClose?.();
                    }}
                >
                    <Plus size={18} />
                    New Prompt
                </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
                {/* Main Links */}
                <div className="space-y-1">
                    <button
                        onClick={() => {
                            selectProject(null);
                            navigate('/');
                            onClose?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 group text-left"
                    >
                        <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                        <span>All Prompts</span>
                    </button>
                    <button
                        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 group text-left"
                    >
                        <Search size={18} className="group-hover:scale-110 transition-transform" />
                        <span>Search</span>
                        <kbd className="ml-auto text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
                    </button>
                </div>

                {/* Projects */}
                <div className="space-y-1">
                    <div className="px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Projects</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                            onClick={handleCreateProject}
                            aria-label="Create new project"
                        >
                            <Plus size={12} />
                        </Button>
                    </div>
                    {projects.map(project => (
                        <div key={project.id} className="relative group">
                            <button
                                onClick={() => {
                                    selectProject(project.id);
                                    navigate('/');
                                    onClose?.();
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-left",
                                    selectedProject === project.id
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                )}
                            >
                                <Folder size={18} className="group-hover:scale-110 transition-transform shrink-0" style={{ color: project.color }} />
                                <span className="truncate flex-1">{project.name}</span>
                                {selectedProject === project.id && (
                                    <ChevronRight size={14} className="opacity-50 shrink-0" />
                                )}
                            </button>
                            
                            {/* Project actions menu */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProjectMenuOpen(projectMenuOpen === project.id ? null : project.id);
                                        }}
                                        aria-label="Project options"
                                    >
                                        <MoreHorizontal size={14} />
                                    </Button>
                                    
                                    <AnimatePresence>
                                        {projectMenuOpen === project.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                                            >
                                                <button
                                                    onClick={(e) => handleEditProject(project, e)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteProject(project, e)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-destructive hover:bg-destructive/10 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <div className="px-3 py-4 text-center">
                            <Folder className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">No projects yet</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCreateProject}
                                className="text-xs"
                            >
                                Create your first project
                            </Button>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {uniqueTags.length > 0 && (
                    <div className="space-y-1">
                        <div className="px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                            Tags
                        </div>
                        {uniqueTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                    // Filter prompts by tag - navigate to dashboard with tag filter
                                    navigate(`/?tag=${encodeURIComponent(tag)}`);
                                    onClose?.();
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                            >
                                <Hash size={14} className="opacity-70" />
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-white/50 dark:hover:bg-white/10">
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="rounded-full hover:bg-white/50 dark:hover:bg-white/10">
                        <Settings size={18} />
                    </Button>
                </div>

                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        aria-label="Sign out"
                    >
                        <LogOut size={16} />
                    </Button>
                </div>
            </div>

            {/* Project Modal */}
            <ProjectModal
                open={showProjectModal}
                onOpenChange={setShowProjectModal}
                project={editingProject}
                onSuccess={handleProjectSuccess}
            />

            {/* Confirm Dialog */}
            <ConfirmDialogComponent {...dialogProps} />

            {/* Click outside to close project menu */}
            {projectMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProjectMenuOpen(null)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}
