import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../context/TaskContext';
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2, ChevronDown, Target, Flame, Clock } from 'lucide-react';

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: 'text-primary', bg: 'from-primary/20 to-primary/5', ring: 'stroke-primary' },
  short: { label: 'Short Break', duration: 5 * 60, color: 'text-green-500', bg: 'from-green-500/20 to-green-500/5', ring: 'stroke-green-500' },
  long: { label: 'Long Break', duration: 15 * 60, color: 'text-blue-400', bg: 'from-blue-400/20 to-blue-400/5', ring: 'stroke-blue-400' },
};

const STORAGE_KEY = 'taskify_focus_sessions';

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-50)));
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function FocusMode() {
  const { data } = useTasks();
  const [modeKey, setModeKey] = useState('focus');
  const mode = MODES[modeKey];
  const [timeLeft, setTimeLeft] = useState(mode.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [sessions, setSessions] = useState(loadSessions);
  const [completedThisSession, setCompletedThisSession] = useState(0);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const allTasks = Object.values(data?.tasks || {}).filter(t => {
    const col = Object.values(data?.columns || {}).find(c => c.taskIds?.includes(t.id));
    return col?.id !== 'completed';
  });

  useEffect(() => {
    setTimeLeft(mode.duration);
    setIsRunning(false);
  }, [modeKey]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - (mode.duration - timeLeft) * 1000;
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleSessionComplete = () => {
    if (modeKey === 'focus') {
      const session = {
        id: Date.now(),
        taskId: selectedTaskId,
        taskTitle: data?.tasks?.[selectedTaskId]?.title || 'Unlinked session',
        duration: mode.duration,
        completedAt: new Date().toISOString(),
      };
      const updated = [...loadSessions(), session];
      saveSessions(updated);
      setSessions(updated);
      setCompletedThisSession(p => p + 1);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode.duration);
  };

  const progress = 1 - timeLeft / mode.duration;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference * (1 - progress);

  const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === new Date().toDateString());
  const totalFocusMinutes = todaySessions.length * 25;

  const selectedTask = data?.tasks?.[selectedTaskId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-8"
    >
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Focus Mode
          </h1>
          <p className="text-muted-foreground mt-1">Stay in the zone with the Pomodoro technique.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span><b className="text-foreground">{completedThisSession}</b> sessions today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" />
            <span><b className="text-foreground">{totalFocusMinutes}</b> min focused</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Selector */}
          <div className="glass-card rounded-2xl p-2 flex gap-1">
            {Object.entries(MODES).map(([key, m]) => (
              <button
                key={key}
                onClick={() => setModeKey(key)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  modeKey === key
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Timer Circle */}
          <div className={`glass-card rounded-2xl p-8 flex flex-col items-center bg-gradient-to-b ${mode.bg}`}>
            <div className="relative w-64 h-64">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="110" fill="none" stroke="currentColor" strokeWidth="8" className="text-black/5 dark:text-white/5" />
                <motion.circle
                  cx="120" cy="120" r="110" fill="none" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={mode.ring}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold tabular-nums ${mode.color}`}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest mt-2">{mode.label}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleReset}
                className="w-12 h-12 rounded-full flex items-center justify-center glass hover:bg-black/10 dark:hover:bg-white/10 transition-all text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <motion.button
                onClick={() => setIsRunning(p => !p)}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:bg-primary/90 transition-all text-lg font-bold"
              >
                {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </motion.button>
              <div className="w-12 h-12 rounded-full flex items-center justify-center glass">
                {modeKey === 'focus' ? <Brain className="w-5 h-5 text-primary" /> : <Coffee className="w-5 h-5 text-green-500" />}
              </div>
            </div>

            {/* Completed Pomodoros */}
            <div className="flex gap-2 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < completedThisSession % 4 ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-black/10 dark:bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Complete 4 pomodoros for a long break</p>
          </div>

          {/* Task Selector */}
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Focusing on
            </p>
            <div className="relative">
              <button
                onClick={() => setShowTaskPicker(p => !p)}
                className="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 hover:border-primary/40 transition-colors"
              >
                <span className={selectedTask ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  {selectedTask?.title || 'Select a task to focus on...'}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
              <AnimatePresence>
                {showTaskPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-10 w-full mt-1 glass-card rounded-xl border border-white/20 overflow-hidden shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
                  >
                    <button
                      onClick={() => { setSelectedTaskId(''); setShowTaskPicker(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      No specific task
                    </button>
                    {allTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => { setSelectedTaskId(task.id); setShowTaskPicker(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 transition-colors flex items-center gap-2"
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          task.priority === 'Urgent' || task.priority === 'High' ? 'bg-red-400' :
                          task.priority === 'Medium' ? 'bg-orange-400' : 'bg-blue-400'
                        }`} />
                        {task.title}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Today's Sessions
          </h3>
          {todaySessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-2 py-8">
              <Brain className="w-10 h-10 opacity-20" />
              <p className="text-sm">No sessions yet.<br />Start your first Pomodoro!</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
              {[...todaySessions].reverse().map((s, i) => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                    {todaySessions.length - i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{s.taskTitle}</p>
                    <p className="text-muted-foreground text-xs">{new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">25m</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3">
                <p className="text-2xl font-bold text-primary">{todaySessions.length}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3">
                <p className="text-2xl font-bold text-green-400">{totalFocusMinutes}m</p>
                <p className="text-xs text-muted-foreground">Focused</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
