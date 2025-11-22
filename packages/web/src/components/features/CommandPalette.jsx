import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
    Search,
    FileText,
    Folder,
    Plus,
    Settings,
    Moon,
    Sun,
    LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { projects, prompts, selectProject, signOut } = useStore();

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <Command className="relative w-full max-w-lg rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Command.Input
                        placeholder="Type a command or search..."
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                    <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>

                    <Command.Group heading="Actions">
                        <Command.Item
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            onSelect={() => runCommand(() => navigate('/editor/new'))} // Need to handle new prompt creation logic
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Create New Prompt</span>
                        </Command.Item>
                        <Command.Item
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            onSelect={() => runCommand(() => navigate('/settings'))}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Command.Item>
                        <Command.Item
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            onSelect={async () => runCommand(async () => {
                                const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                                document.documentElement.classList.toggle('dark', newTheme === 'dark');

                                // Save to backend
                                try {
                                    const { settingsService } = await import('@promptzy/shared');
                                    await settingsService.update({ theme: newTheme });
                                } catch (error) {
                                    console.error('Failed to save theme:', error);
                                }
                            })}
                        >
                            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span>Toggle Theme</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Projects">
                        {projects.map((project) => (
                            <Command.Item
                                key={project.id}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onSelect={() => runCommand(() => {
                                    selectProject(project.id);
                                    navigate('/');
                                })}
                            >
                                <Folder className="mr-2 h-4 w-4" style={{ color: project.color }} />
                                <span>{project.name}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>

                    <Command.Group heading="Prompts">
                        {prompts.map((prompt) => (
                            <Command.Item
                                key={prompt.id}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onSelect={() => runCommand(() => navigate(`/editor/${prompt.id}`))}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                <span>{prompt.title}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                </Command.List>
            </Command>
        </div>
    );
}
