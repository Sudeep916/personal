import { AnimatePresence, motion } from 'framer-motion';
import { ToastItem } from '../types';

interface ToastListProps {
  items: ToastItem[];
}

const variantStyles = {
  success: 'bg-emerald-500/95 text-white',
  info: 'bg-sky-500/95 text-white',
  warning: 'bg-amber-500/95 text-slate-950',
  danger: 'bg-rose-500/95 text-white',
};

export default function ToastList({ items }: ToastListProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex flex-col items-center gap-3 px-4 sm:px-6">
      <AnimatePresence>
        {items.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`pointer-events-auto w-full max-w-sm rounded-3xl border border-white/10 px-4 py-3 shadow-soft backdrop-blur-xl ${variantStyles[toast.variant]}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <p className="font-semibold">{toast.title}</p>
                <p className="text-sm opacity-90">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
