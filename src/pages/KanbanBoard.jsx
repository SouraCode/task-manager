import { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useTasks } from "../context/TaskContext";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import TaskListView from "../components/TaskListView";
import { Plus, LayoutGrid, List, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function KanbanBoard() {
  const { data, isLoading, searchQuery, moveTask, addTask, updateTask, deleteTask, addColumn, renameColumn, deleteColumn } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [viewMode, setViewMode] = useState("board"); // "board" or "list"

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

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTask(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index,
      draggableId
    );
  };

  const handleOpenNew = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveModal = (taskData) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(
        taskData.title,
        taskData.description,
        taskData.priority,
        taskData.dueDate,
        taskData.tags
      );
    }
  };

  // Compute all filtered tasks for list view
  const allFilteredTasks = Object.values(data.tasks || {}).filter(task => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return task.title?.toLowerCase().includes(query) || 
           task.description?.toLowerCase().includes(query) || 
           task.tags?.some(tag => tag.toLowerCase().includes(query));
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
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
                .filter(task => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return task.title?.toLowerCase().includes(query) || 
                         task.description?.toLowerCase().includes(query) || 
                         task.tags?.some(tag => tag.toLowerCase().includes(query));
                });

              return (
                <div key={column.id} className="min-w-[320px] w-[320px] flex flex-col">
                  <div className="flex justify-between items-center mb-4 px-2 group">
                    <h3 className="font-semibold text-lg flex items-center space-x-2 flex-1">
                      <span 
                        onClick={() => {
                          const newTitle = window.prompt("Rename column:", column.title);
                          if(newTitle && newTitle.trim() !== "") {
                            renameColumn(column.id, newTitle);
                          }
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
                          if(window.confirm(`Delete column "${column.title}"? All tasks inside will be deleted.`)) {
                            deleteColumn(column.id);
                          }
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
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
            
            <div className="min-w-[320px] w-[320px] flex flex-col pt-[52px]">
              <button 
                onClick={() => {
                  const title = window.prompt("Enter new column name:");
                  if(title && title.trim() !== "") {
                    addColumn(title);
                  }
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
