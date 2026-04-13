import { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useTasks } from "../context/TaskContext";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { Plus, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function KanbanBoard() {
  const { data, moveTask, addTask, updateTask, resetData } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Kanban Board
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetData}
            title="Reset to initial sample data"
            className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 border border-white/10 text-foreground px-4 py-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return (
              <div key={column.id} className="min-w-[320px] w-[320px] flex flex-col">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="font-semibold text-lg flex items-center space-x-2">
                    <span>{column.title}</span>
                    <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded-full text-muted-foreground">
                      {tasks.length}
                    </span>
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
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        taskToEdit={taskToEdit}
      />
    </motion.div>
  );
}
