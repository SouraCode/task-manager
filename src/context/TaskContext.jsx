import { createContext, useContext, useEffect, useState } from "react";
//taskContext
const initialData = {
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Explore Task Manager",
      description: "Welcome to your new modern Task Manager! Try dragging me to another column.",
      priority: "High",
      dueDate: new Date().toISOString(),
      tags: ["welcome", "onboarding"]
    },
    "task-2": {
      id: "task-2",
      title: "Customize Settings",
      description: "Toggle Dark/Light mode from the Top Navbar.",
      priority: "Medium",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      tags: ["settings"]
    }
  },
  columns: {
    todo: {
      id: "todo",
      title: "To Do",
      taskIds: ["task-1", "task-2"],
    },
    "in-progress": {
      id: "in-progress",
      title: "In Progress",
      taskIds: [],
    },
    completed: {
      id: "completed",
      title: "Done",
      taskIds: [],
    },
  },
  columnOrder: ["todo", "in-progress", "completed"],
};

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("task-manager-data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem("task-manager-data", JSON.stringify(data));
  }, [data]);

  const addTask = (title, description, priority, dueDate, tags, status = "todo") => {
    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      title,
      description,
      priority,
      dueDate,
      tags
    };

    setData((prev) => {
      const newTasks = { ...prev.tasks, [newTaskId]: newTask };
      const column = prev.columns[status];
      const newTaskIds = Array.from(column.taskIds);
      newTaskIds.unshift(newTaskId); // Add to top

      const newColumn = { ...column, taskIds: newTaskIds };

      return {
        ...prev,
        tasks: newTasks,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      };
    });
  };

  const updateTask = (id, updatedFields) => {
    setData((prev) => {
      const task = prev.tasks[id];
      if (!task) return prev;
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [id]: { ...task, ...updatedFields }
        }
      };
    });
  };

  const deleteTask = (id) => {
    setData((prev) => {
      const newTasks = { ...prev.tasks };
      delete newTasks[id];

      // Remove from columns
      const newColumns = { ...prev.columns };
      for (const colId of prev.columnOrder) {
        newColumns[colId] = {
          ...newColumns[colId],
          taskIds: newColumns[colId].taskIds.filter((taskId) => taskId !== id)
        };
      }

      return {
        ...prev,
        tasks: newTasks,
        columns: newColumns
      };
    });
  };

  const moveTask = (sourceId, destinationId, sourceIndex, destinationIndex, draggableId) => {
    setData((prev) => {
      const startColumn = prev.columns[sourceId];
      const finishColumn = prev.columns[destinationId];

      // Moving within the same column
      if (startColumn === finishColumn) {
        const newTaskIds = Array.from(startColumn.taskIds);
        newTaskIds.splice(sourceIndex, 1);
        newTaskIds.splice(destinationIndex, 0, draggableId);

        const newColumn = {
          ...startColumn,
          taskIds: newTaskIds,
        };

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [newColumn.id]: newColumn,
          },
        };
      }

      // Moving from one column to another
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(sourceIndex, 1);
      const newStart = {
        ...startColumn,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(finishColumn.taskIds);
      finishTaskIds.splice(destinationIndex, 0, draggableId);
      const newFinish = {
        ...finishColumn,
        taskIds: finishTaskIds,
      };

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      };
    });
  };

  const value = {
    data,
    addTask,
    updateTask,
    deleteTask,
    moveTask
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export const useTasks = () => useContext(TaskContext);
