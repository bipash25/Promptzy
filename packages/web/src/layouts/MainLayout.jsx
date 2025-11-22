import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import CommandPalette from '../components/features/CommandPalette';
import { Menu } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function MainLayout({ children }) {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 shrink-0">
                <Sidebar />
            </div>

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
                <div className="md:hidden p-4 border-b border-border flex items-center gap-3 bg-background/80 backdrop-blur-md sticky top-0 z-30">
                    <Button variant="ghost" size="icon" onClick={() => setShowMobileSidebar(true)}>
                        <Menu size={20} />
                    </Button>
                    <h1 className="font-bold text-lg">Promptzy</h1>
                </div>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
                <CommandPalette />
            </div>
        </div>
    );
}
