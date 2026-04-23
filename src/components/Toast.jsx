import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
  overdue: <Bell className="w-4 h-4 text-red-400" />,
};

const borders = {
  success: 'border-l-green-400',
  error: 'border-l-red-400',
  warning: 'border-l-orange-400',
  info: 'border-l-blue-400',
  overdue: 'border-l-red-400',
};

function ToastItem({ toast }) {
  const { removeToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`glass-card border-l-4 ${borders[toast.type] || borders.info} rounded-xl px-4 py-3 shadow-xl w-80 flex items-start gap-3 cursor-default`}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type] || icons.info}</div>
      <p className="text-sm text-foreground flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function Toast() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
