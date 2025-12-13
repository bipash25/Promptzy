import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FileText, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { templates, templateCategories, getTemplatesByCategory, searchTemplates } from '../../data/templates';
import { cn } from '../../lib/utils';

export default function TemplateLibrary({ open, onClose, onSelectTemplate }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredTemplates = useMemo(() => {
        let result = templates;

        if (searchQuery) {
            result = searchTemplates(searchQuery);
        } else if (selectedCategory !== 'all') {
            result = getTemplatesByCategory(selectedCategory);
        }

        return result;
    }, [searchQuery, selectedCategory]);

    const handleSelectTemplate = (template) => {
        if (onSelectTemplate) {
            onSelectTemplate(template);
        } else {
            // Navigate to editor with template content
            navigate('/editor/new', {
                state: {
                    title: template.title,
                    content: template.content,
                    tags: template.tags
                }
            });
        }
        onClose();
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-4xl max-h-[85vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Template Library</h2>
                                    <p className="text-sm text-muted-foreground">Choose from {templates.length}+ pre-built templates</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="px-6 py-3 border-b border-border overflow-x-auto">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                    selectedCategory === 'all'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                All Templates
                            </button>
                            {templateCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5",
                                        selectedCategory === cat.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                    )}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {filteredTemplates.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                <p className="text-muted-foreground">No templates found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTemplates.map((template) => {
                                    const category = templateCategories.find(c => c.id === template.category);
                                    return (
                                        <motion.button
                                            key={template.id}
                                            onClick={() => handleSelectTemplate(template)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                                                    style={{ backgroundColor: `${category?.color}20` }}
                                                >
                                                    {category?.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                                                        {template.title}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {template.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {template.tags.slice(0, 3).map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">
                            Templates include variable placeholders like <code className="bg-muted px-1 rounded">{'{{variable}}'}</code> that you can customize
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
