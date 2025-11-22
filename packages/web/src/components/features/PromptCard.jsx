import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Star, Copy, MoreVertical, Clock, Hash } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

function PromptCard({ prompt, onToggleFavorite }) {
    const navigate = useNavigate();

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.content).catch(() => {
            // Fallback for non-HTTPS or unsupported browsers
            const textarea = document.createElement('textarea');
            textarea.value = prompt.content;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
        >
            <Card
                className="h-full group cursor-pointer glass-card border-white/20 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 overflow-hidden relative"
                onClick={() => navigate(`/editor/${prompt.id}`)}
            >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <CardHeader className="pb-2 relative z-10">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {prompt.title || 'Untitled Prompt'}
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 -mt-1 -mr-2 transition-colors",
                                prompt.favorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500 opacity-0 group-hover:opacity-100"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite?.(prompt.id);
                            }}
                        >
                            <Star size={18} fill={prompt.favorite ? "currentColor" : "none"} />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock size={12} />
                        <span>{formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true })}</span>
                    </div>
                </CardHeader>

                <CardContent className="pb-2 relative z-10">
                    <p className="text-sm text-muted-foreground line-clamp-3 font-mono bg-muted/30 p-2 rounded-md border border-white/5">
                        {prompt.content || <span className="italic opacity-50">Empty prompt...</span>}
                    </p>
                </CardContent>

                <CardFooter className="pt-2 flex justify-between items-center relative z-10">
                    <div className="flex gap-1 overflow-hidden">
                        {prompt.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-white/10">
                                <Hash size={10} className="mr-0.5 opacity-70" />
                                {tag}
                            </span>
                        ))}
                        {prompt.tags?.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground">
                                +{prompt.tags.length - 2}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={handleCopy}
                            title="Copy content"
                        >
                            <Copy size={16} />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

export default React.memo(PromptCard);
