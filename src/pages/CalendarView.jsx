import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../context/TaskContext';
import { ChevronLeft, ChevronRight, Circle, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';

const PRIORITY_COLORS = {
  Urgent: 'bg-red-500',
  High: 'bg-red-400',
  Medium: 'bg-orange-400',
  Low: 'bg-blue-400',
};

export default function CalendarView() {
  const { data, isLoading } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allTasks = Object.values(data.tasks || {});

  // Get tasks for a specific date
  const getTasksForDate = (date) =>
    allTasks.filter(task => task.dueDate && isSameDay(parseISO(task.dueDate), date));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Leading empty cells (Sunday = 0)
  const startDay = getDay(monthStart);
  const leadingBlanks = Array.from({ length: startDay });

  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">Tasks organized by due date.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(p => subMonths(p, 1))}
            className="p-2 rounded-xl glass hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold w-36 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(p => addMonths(p, 1))}
            className="p-2 rounded-xl glass hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-2 rounded-xl text-sm font-medium glass hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground ml-2"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {leadingBlanks.map((_, i) => <div key={`blank-${i}`} />)}
            {daysInMonth.map(date => {
              const tasksOnDay = getTasksForDate(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);

              return (
                <motion.button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(isSameDay(date, selectedDate) ? null : date)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex flex-col items-center p-2 rounded-xl min-h-[60px] transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : isCurrentDay
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-foreground'
                  }`}
                >
                  <span className={`text-sm font-medium ${isCurrentDay && !isSelected ? 'font-bold' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  {tasksOnDay.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center max-w-full">
                      {tasksOnDay.slice(0, 3).map(task => (
                        <span
                          key={task.id}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : PRIORITY_COLORS[task.priority] || 'bg-primary'}`}
                        />
                      ))}
                      {tasksOnDay.length > 3 && (
                        <span className={`text-[8px] font-bold ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                          +{tasksOnDay.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Panel */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          <AnimatePresence mode="wait">
            {!selectedDate ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-2"
              >
                <CalendarDays className="w-10 h-10 opacity-20" />
                <p className="text-sm">Click a date to see tasks due that day.</p>
              </motion.div>
            ) : selectedTasks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-2"
              >
                <Circle className="w-8 h-8 opacity-20" />
                <p className="text-sm">No tasks due on this day.</p>
              </motion.div>
            ) : (
              <motion.div
                key="tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 space-y-3 overflow-y-auto custom-scrollbar"
              >
                {selectedTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl bg-black/5 dark:bg-white/5 border-l-4 ${
                      task.colorLabel ? '' : 'border-l-transparent'
                    } flex flex-col gap-1`}
                    style={task.colorLabel ? { borderLeftColor: task.colorLabel } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        task.priority === 'Urgent' || task.priority === 'High'
                          ? 'bg-red-500/10 text-red-400'
                          : task.priority === 'Medium'
                          ? 'bg-orange-500/10 text-orange-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>{task.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">{task.title}</p>
                    {task.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Month summary */}
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-center">
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3">
              <p className="text-2xl font-bold text-primary">
                {allTasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), new Date())).length}
              </p>
              <p className="text-xs text-muted-foreground">Due Today</p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3">
              <p className="text-2xl font-bold text-orange-400">
                {allTasks.filter(t => t.dueDate && parseISO(t.dueDate) < new Date() && !data.columns?.completed?.taskIds?.includes(t.id)).length}
              </p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
