import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { authService } from '@promptzy/shared';
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
    Command
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ onClose }) {
    const navigate = useNavigate();
    const { user, projects, settings, signOut } = useStore();
    const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        document.documentElement.classList.toggle('dark', newTheme);
        // Ideally save to settings store/backend here
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
                    <NavItem to="/" icon={LayoutDashboard} label="All Prompts" end />
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
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/10 hover:text-primary">
                            <Plus size={12} />
                        </Button>
                    </div>
                    {projects.map(project => (
                        <NavItem
                            key={project.id}
                            to={`/project/${project.id}`}
                            icon={Folder}
                            label={project.name}
                        />
                    ))}
                    {projects.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground italic opacity-50">
                            No projects yet
                        </div>
                    )}
                </div>

                {/* Tags (Mockup for now) */}
                <div className="space-y-1">
                    <div className="px-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                        Tags
                    </div>
                    {['creative', 'coding', 'writing'].map(tag => (
                        <NavLink
                            key={tag}
                            to={`/tag/${tag}`}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                    isActive
                                        ? "text-primary bg-primary/5"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                )
                            }
                        >
                            <Hash size={14} className="opacity-70" />
                            {tag}
                        </NavLink>
                    ))}
                </div>
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
                    >
                        <LogOut size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
