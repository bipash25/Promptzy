import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Info, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

const dialogVariants = {
  danger: {
    icon: AlertTriangle,
    iconClassName: 'text-destructive bg-destructive/10',
    confirmClassName: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    icon: AlertCircle,
    iconClassName: 'text-yellow-500 bg-yellow-500/10',
    confirmClassName: 'bg-yellow-500 text-white hover:bg-yellow-600',
  },
  info: {
    icon: Info,
    iconClassName: 'text-blue-500 bg-blue-500/10',
    confirmClassName: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  question: {
    icon: HelpCircle,
    iconClassName: 'text-primary bg-primary/10',
    confirmClassName: 'bg-primary text-primary-foreground hover:bg-primary/90',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  children,
}) {
  const { icon: Icon, iconClassName, confirmClassName } = dialogVariants[variant] || dialogVariants.danger;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleConfirm = async () => {
    await onConfirm?.();
    onOpenChange?.(false);
  };

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Prevent body scroll when dialog is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
            aria-hidden="true"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            className="relative w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-4', iconClassName)}>
                <Icon size={24} />
              </div>

              {/* Title */}
              <h2 id="dialog-title" className="text-xl font-semibold text-foreground mb-2">
                {title}
              </h2>

              {/* Description */}
              {description && (
                <p id="dialog-description" className="text-muted-foreground mb-4">
                  {description}
                </p>
              )}

              {/* Custom content */}
              {children && <div className="mb-4">{children}</div>}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  className={cn('flex-1', confirmClassName)}
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Hook for easier dialog management
export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState({
    open: false,
    title: '',
    description: '',
    variant: 'danger',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
  });

  const confirm = React.useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title: options.title || 'Are you sure?',
        description: options.description || '',
        variant: options.variant || 'danger',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }, []);

  const dialogProps = {
    open: dialogState.open,
    onOpenChange: (open) => {
      if (!open) {
        dialogState.onCancel?.();
      }
      setDialogState((prev) => ({ ...prev, open }));
    },
    onConfirm: dialogState.onConfirm,
    onCancel: dialogState.onCancel,
    title: dialogState.title,
    description: dialogState.description,
    variant: dialogState.variant,
    confirmText: dialogState.confirmText,
    cancelText: dialogState.cancelText,
  };

  return { confirm, dialogProps, ConfirmDialog };
}

export default ConfirmDialog;