import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Variable, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { extractVariables, fillVariables } from '../../utils/variableParser';
import { cn } from '../../lib/utils';

export default function VariableFillModal({ open, onClose, content, onCopy }) {
    const [values, setValues] = useState({});
    const [copied, setCopied] = useState(false);

    const variables = useMemo(() => extractVariables(content), [content]);

    const filledContent = useMemo(() => {
        return fillVariables(content, values);
    }, [content, values]);

    // Initialize values with defaults
    useEffect(() => {
        if (open && variables.length > 0) {
            const initialValues = {};
            variables.forEach(v => {
                initialValues[v.name] = v.defaultValue || '';
            });
            setValues(initialValues);
        }
    }, [open, variables]);

    const handleValueChange = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(filledContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onCopy) {
            onCopy(filledContent);
        }
    };

    const allFilled = variables.every(v => values[v.name]?.trim());

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
                    className="w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <Variable className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Fill Variables</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {variables.length} variable{variables.length !== 1 ? 's' : ''} to fill
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X size={20} />
                            </Button>
                        </div>
                    </div>

                    {/* Variables Form */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {variables.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Variable className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No variables found in this prompt</p>
                                <p className="text-sm mt-1">Use {'{{variableName}}'} to add variables</p>
                            </div>
                        ) : (
                            variables.map((variable) => (
                                <div key={variable.name} className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <span className="text-purple-500">{'{'}{'{'}  </span>
                                        {variable.name}
                                        <span className="text-purple-500">  {'}'}{'}'}</span>
                                        {variable.type !== 'text' && (
                                            <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                                                {variable.type}
                                            </span>
                                        )}
                                    </label>

                                    {variable.type === 'textarea' ? (
                                        <textarea
                                            value={values[variable.name] || ''}
                                            onChange={(e) => handleValueChange(variable.name, e.target.value)}
                                            placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                            className="w-full p-3 rounded-lg border border-input bg-background text-sm resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    ) : variable.type === 'select' && variable.options.length > 0 ? (
                                        <select
                                            value={values[variable.name] || ''}
                                            onChange={(e) => handleValueChange(variable.name, e.target.value)}
                                            className="w-full p-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">Select {variable.name}...</option>
                                            {variable.options.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            type={variable.type === 'number' ? 'number' : 'text'}
                                            value={values[variable.name] || ''}
                                            onChange={(e) => handleValueChange(variable.name, e.target.value)}
                                            placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Preview */}
                    {variables.length > 0 && (
                        <div className="border-t border-border p-4 bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <Wand2 size={14} className="text-purple-500" />
                                    Preview
                                </span>
                                <Button
                                    size="sm"
                                    onClick={handleCopy}
                                    disabled={!allFilled}
                                    className={cn(copied && "bg-green-500 hover:bg-green-500")}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={14} className="mr-1" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} className="mr-1" />
                                            Copy Result
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="max-h-[150px] overflow-y-auto p-3 rounded-lg bg-background border border-border text-sm font-mono whitespace-pre-wrap">
                                {filledContent.slice(0, 500)}
                                {filledContent.length > 500 && '...'}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
