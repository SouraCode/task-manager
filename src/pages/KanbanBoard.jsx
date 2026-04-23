import { useState, useRef } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useTasks } from "../context/TaskContext";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import TaskListView from "../components/TaskListView";
import FilterBar from "../components/FilterBar";
import { Plus, LayoutGrid, List, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KanbanBoard() {
  const { data, isLoading, searchQuery, moveTask, addTask, updateTask, deleteTask, addColumn, renameColumn, deleteColumn } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [viewMode, setViewMode] = useState("board");

  // Filter state
  const [activeTags, setActiveTags] = useState([]);
  const [activePriorities, setActivePriorities] = useState([]);

  // Quick-add state per column
  const [quickAddCol, setQuickAddCol] = useState(null);
  const [quickAddText, setQuickAddText] = useState("");
  const quickAddRef = useRef(null);

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-muted-foreground font-medium">Loading tasks...</span>
        </div>
      </div>
    );
  }

  // Collect all tags from tasks
  const allTags = [...new Set(Object.values(data.tasks || {}).flatMap(t => t.tags || []))];

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveTask(source.droppableId, destination.droppableId, source.index, destination.index, draggableId);
  };

  const handleOpenNew = () => { setTaskToEdit(null); setIsModalOpen(true); };
  const handleOpenEdit = (task) => { setTaskToEdit(task); setIsModalOpen(true); };

  const handleSaveModal = (taskData) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData.title, taskData.description, taskData.priority, taskData.dueDate, taskData.tags, taskData.colorLabel, taskData.estimatedHours, taskData.coverImage, taskData.subtasks);
    }
  };

  // Filter logic
  const filterTask = (task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!task.title?.toLowerCase().includes(q) && !task.description?.toLowerCase().includes(q) && !task.tags?.some(t => t.toLowerCase().includes(q))) return false;
    }
    if (activePriorities.length > 0 && !activePriorities.includes(task.priority)) return false;
    if (activeTags.length > 0 && !activeTags.some(t => task.tags?.includes(t))) return false;
    return true;
  };

  const allFilteredTasks = Object.values(data.tasks || {}).filter(filterTask);

  const toggleTag = (tag) => setActiveTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);
  const togglePriority = (p) => setActivePriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const clearFilters = () => { setActiveTags([]); setActivePriorities([]); };

  const handleQuickAdd = (columnId) => {
    if (quickAddText.trim()) {
      addTask(quickAddText.trim(), "", "Medium", new Date().toISOString(), [], "", null, "", [], columnId);
    }
    setQuickAddText("");
    setQuickAddCol(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Tasks
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex glass bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-white/5 mr-2">
            <button
              onClick={() => setViewMode("board")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "board" ? "bg-white/10 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Board View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white/10 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {(allTags.length > 0 || true) && (
        <FilterBar
          allTags={allTags}
          activeTags={activeTags}
          activePriorities={activePriorities}
          onToggleTag={toggleTag}
          onTogglePriority={togglePriority}
          onClear={clearFilters}
        />
      )}

      {viewMode === "list" ? (
        <div className="flex-1 overflow-auto pb-4">
          <TaskListView tasks={allFilteredTasks} onEdit={handleOpenEdit} onDelete={deleteTask} />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-1 gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {(data.columnOrder || []).map((columnId) => {
              const column = data.columns?.[columnId];
              if (!column) return null;

              const tasks = (column.taskIds || [])
                .map((taskId) => data.tasks?.[taskId])
                .filter(Boolean)
                .filter(filterTask);

              const isAddingHere = quickAddCol === columnId;

              return (
                <div key={column.id} className="min-w-[320px] w-[320px] flex flex-col">
                  <div className="flex justify-between items-center mb-4 px-2 group">
                    <h3 className="font-semibold text-lg flex items-center space-x-2 flex-1">
                      <span
                        onClick={() => {
                          const newTitle = window.prompt("Rename column:", column.title);
                          if (newTitle && newTitle.trim() !== "") renameColumn(column.id, newTitle);
                        }}
                        className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 -ml-2 rounded-md transition-colors"
                        title="Click to rename"
                      >
                        {column.title}
                      </span>
                      <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded-full text-muted-foreground mr-auto">
                        {tasks.length}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete column "${column.title}"? All tasks inside will be deleted.`)) deleteColumn(column.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-all"
                        title="Delete column"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </h3>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 glass p-4 rounded-2xl border border-white/5 transition-colors ${
                          snapshot.isDraggingOver ? "bg-black/5 dark:bg-white/5 border-primary/50" : ""
                        }`}
                      >
                        {tasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={handleOpenEdit}
                            onDelete={() => deleteTask(task.id)}
                          />
                        ))}
                        {provided.placeholder}

                        {/* Quick-Add inline */}
                        <AnimatePresence>
                          {isAddingHere ? (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="mt-2 flex gap-2"
                            >
                              <input
                                ref={quickAddRef}
                                autoFocus
                                type="text"
                                value={quickAddText}
                                onChange={e => setQuickAddText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleQuickAdd(columnId);
                                  if (e.key === 'Escape') { setQuickAddCol(null); setQuickAddText(""); }
                                }}
                                placeholder="Task title, then Enter..."
                                className="flex-1 bg-black/5 dark:bg-white/5 border border-primary/40 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                              />
                              <button
                                onClick={() => handleQuickAdd(columnId)}
                                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ) : (
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => { setQuickAddCol(columnId); setQuickAddText(""); }}
                              className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors group/btn"
                            >
                              <Plus className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                              <span>Quick add...</span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}

            {/* Add Column */}
            <div className="min-w-[320px] w-[320px] flex flex-col pt-[52px]">
              <button
                onClick={() => {
                  const title = window.prompt("Enter new column name:");
                  if (title && title.trim() !== "") addColumn(title);
                }}
                className="flex-1 min-h-[150px] border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-black/20 dark:hover:border-white/20 transition-all group bg-black/5 dark:bg-white/5"
              >
                <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                  <span className="font-medium">Add Column</span>
                </div>
              </button>
            </div>
          </div>
        </DragDropContext>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        taskToEdit={taskToEdit}
      />
    </motion.div>
  );
}
