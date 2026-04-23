import { useState, useEffect } from "react";
import { X, Plus, Trash2, Clock, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_LABELS = [
  { value: '', label: 'None' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#a855f7', label: 'Purple' },
];

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit = null }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [assignee, setAssignee] = useState(null);
  const [colorLabel, setColorLabel] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split("T")[0] : "");
      setTags(taskToEdit.tags ? taskToEdit.tags.join(", ") : "");
      setCoverImage(taskToEdit.coverImage || "");
      setSubtasks(taskToEdit.subtasks || []);
      setAssignee(taskToEdit.assignee || null);
      setColorLabel(taskToEdit.colorLabel || "");
      setEstimatedHours(taskToEdit.estimatedHours ? String(taskToEdit.estimatedHours) : "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
      setTags("");
      setCoverImage("");
      setSubtasks([]);
      setAssignee(null);
      setNewSubtask("");
      setColorLabel("");
      setEstimatedHours("");
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    const formattedDate = dueDate ? new Date(dueDate).toISOString() : new Date().toISOString();

    onSave({
      title,
      description,
      priority,
      dueDate: formattedDate,
      tags: tagArray,
      coverImage,
      subtasks,
      assignee,
      colorLabel,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg p-6 rounded-2xl pointer-events-auto shadow-2xl border border-white/20 dark:border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Color label accent bar */}
              {colorLabel && (
                <div className="h-1.5 w-full rounded-full mb-5" style={{ backgroundColor: colorLabel }} />
              )}

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {taskToEdit ? "Edit Task" : "New Task"}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Enter task title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    placeholder="Add details..."
                  />
                </div>

                {/* Priority + Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    >
                      <option className="bg-background text-foreground" value="Low">Low</option>
                      <option className="bg-background text-foreground" value="Medium">Medium</option>
                      <option className="bg-background text-foreground" value="High">High</option>
                      <option className="bg-background text-foreground" value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Tags + Estimated Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="e.g. ui, devops"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Est. Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="e.g. 2.5"
                    />
                  </div>
                </div>

                {/* Color Label */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" /> Color Label
                  </label>
                  <div className="flex gap-2">
                    {COLOR_LABELS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColorLabel(c.value)}
                        title={c.label}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          colorLabel === c.value ? 'scale-125 border-foreground/50 shadow-md' : 'border-transparent hover:scale-110'
                        }`}
                        style={c.value ? { backgroundColor: c.value } : { background: 'linear-gradient(135deg, #ccc 50%, #fff 50%)', border: '2px solid #ccc' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Cover Image URL</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Subtasks */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Subtasks</label>
                  {subtasks.length > 0 && (
                    <div className="space-y-2 mb-2 max-h-32 overflow-y-auto custom-scrollbar">
                      {subtasks.map((st, idx) => (
                        <div key={st.id || idx} className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 px-2 py-1.5 rounded-md border border-white/5">
                          <input 
                            type="checkbox"
                            checked={st.completed}
                            onChange={(e) => {
                              const newSt = [...subtasks];
                              newSt[idx].completed = e.target.checked;
                              setSubtasks(newSt);
                            }}
                            className="rounded text-primary focus:ring-primary/50 bg-black/10 dark:bg-white/10 border-white/20 w-4 h-4 cursor-pointer accent-primary"
                          />
                          <span className={`text-sm flex-1 ${st.completed ? 'line-through text-muted-foreground opacity-50' : 'text-foreground'}`}>
                            {st.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))}
                            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newSubtask.trim()) {
                            setSubtasks([...subtasks, { id: `st-${Date.now()}`, title: newSubtask.trim(), completed: false }]);
                            setNewSubtask("");
                          }
                        }
                      }}
                      className="flex-1 bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Add subtask (press Enter)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSubtask.trim()) {
                          setSubtasks([...subtasks, { id: `st-${Date.now()}`, title: newSubtask.trim(), completed: false }]);
                          setNewSubtask("");
                        }
                      }}
                      className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 px-3 py-2 rounded-lg transition-colors border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex justify-end space-x-3 mt-4 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {taskToEdit ? "Save Changes" : "Create Task"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
