import React, { useState, useCallback } from 'react';
import Sidebar from '../components/layout/Sidebar';
import CommandPalette from '../components/features/CommandPalette';
import { Menu } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function MainLayout({ children }) {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Handle skip to content click
    const handleSkipToContent = useCallback((e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Skip to Content Link - Accessibility */}
            <a
                href="#main-content"
                onClick={handleSkipToContent}
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
            >
                Skip to main content
            </a>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 shrink-0" aria-label="Main navigation">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-transform duration-300 ease-in-out md:hidden",
                showMobileSidebar ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar onClose={() => setShowMobileSidebar(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden p-4 border-b border-border flex items-center gap-3 bg-background/80 backdrop-blur-md sticky top-0 z-30">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowMobileSidebar(true)}
                        aria-label="Open navigation menu"
                        aria-expanded={showMobileSidebar}
                        aria-controls="mobile-sidebar"
                    >
                        <Menu size={20} aria-hidden="true" />
                    </Button>
                    <h1 className="font-bold text-lg">Promptzy</h1>
                </header>

                <main
                    id="main-content"
                    className="flex-1 overflow-y-auto"
                    tabIndex={-1}
                    role="main"
                    aria-label="Main content"
                >
                    {children}
                </main>
                <CommandPalette />
            </div>
        </div>
    );
}
