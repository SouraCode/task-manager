import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);

  // Fetch initial data from server
  useEffect(() => {
    const fetchBoard = async () => {
      if (!token || !user) {
         setData(null);
         setIsLoading(false);
         return;
      }
      try {
        setIsLoading(true);
        const res = await fetch("/api/board", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const boardData = await res.json();
          setData(boardData);
          isInitialMount.current = true; // reset mount flag when new user dataloads
        }
      } catch(err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoard();
  }, [token, user]);

  // Sync data to server on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!token || !data) return;

    const syncTimer = setTimeout(async () => {
      try {
        await fetch("/api/board", {
          method: "PUT",
          headers: {
             "Authorization": `Bearer ${token}`,
             "Content-Type": "application/json"
          },
          body: JSON.stringify({ boardData: data })
        });
      } catch (err) {
        console.error("Failed to sync board data", err);
      }
    }, 500); // debounce API calls by 500ms

    return () => clearTimeout(syncTimer);
  }, [data, token]);

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
      if(!prev) return prev;
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
      if(!prev) return prev;
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
      if(!prev) return prev;
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
      if(!prev) return prev;
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
    setData,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    moveTask
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export const useTasks = () => useContext(TaskContext);
