import { X, Tag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];
const PRIORITY_COLORS = {
  Urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-red-400/10 text-red-400 border-red-400/20',
  Medium: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  Low: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
};

export default function FilterBar({ allTags, activeTags, activePriorities, onToggleTag, onTogglePriority, onClear }) {
  const hasFilters = activeTags.length > 0 || activePriorities.length > 0;

  return (
    <div className="glass-card rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 border border-white/10">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
        <Tag className="w-3.5 h-3.5" />
        Filter
      </div>

      {/* Priority filters */}
      <div className="flex flex-wrap gap-1.5">
        {PRIORITIES.map(p => (
          <button
            key={p}
            onClick={() => onTogglePriority(p)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activePriorities.includes(p)
                ? `${PRIORITY_COLORS[p]} scale-105 shadow-sm`
                : 'border-white/10 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />{p}
          </button>
        ))}
      </div>

      {/* Divider */}
      {allTags.length > 0 && <div className="w-px h-5 bg-white/10 shrink-0" />}

      {/* Tag filters */}
      <div className="flex flex-wrap gap-1.5">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activeTags.includes(tag)
                ? 'bg-primary/15 text-primary border-primary/30 scale-105 shadow-sm'
                : 'border-white/10 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Clear button */}
      <AnimatePresence>
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClear}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg transition-all border border-white/10"
          >
            <X className="w-3 h-3" /> Clear
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
