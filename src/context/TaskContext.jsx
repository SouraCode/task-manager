import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { isBefore, parseISO } from "date-fns";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isInitialMount = useRef(true);
  const notifiedOverdue = useRef(false);

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
          isInitialMount.current = true;
          notifiedOverdue.current = false; // Reset for new load
        }
      } catch(err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoard();
  }, [token, user]);

  // Check for overdue tasks once data is loaded
  useEffect(() => {
    if (data && !notifiedOverdue.current) {
      const tasks = Object.values(data.tasks || {});
      const overdueCount = tasks.filter(t => 
        t.dueDate && 
        isBefore(parseISO(t.dueDate), new Date()) && 
        !data.columns?.completed?.taskIds?.includes(t.id)
      ).length;

      if (overdueCount > 0) {
        addToast(`You have ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}!`, 'overdue');
        notifiedOverdue.current = true;
      }
    }
  }, [data, addToast]);

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

  const addTask = (title, description, priority, dueDate, tags, colorLabel = "", estimatedHours = null, coverImage = "", subtasks = [], status = "todo") => {
    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      title,
      description,
      priority,
      dueDate,
      tags,
      colorLabel,
      estimatedHours,
      coverImage,
      subtasks,
      createdAt: new Date().toISOString()
    };

    setData((prev) => {
      if(!prev) return prev;
      const newTasks = { ...prev.tasks, [newTaskId]: newTask };
      const column = prev.columns[status] || prev.columns["todo"];
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

  const addColumn = (title) => {
    const newColId = `col-${Date.now()}`;
    setData((prev) => {
      if(!prev) return prev;
      return {
        ...prev,
        columns: {
          ...prev.columns,
          [newColId]: { id: newColId, title, taskIds: [] }
        },
        columnOrder: [...prev.columnOrder, newColId]
      };
    });
  };

  const renameColumn = (id, newTitle) => {
    setData((prev) => {
      if(!prev) return prev;
      return {
        ...prev,
        columns: {
          ...prev.columns,
          [id]: { ...prev.columns[id], title: newTitle }
        }
      };
    });
  };

  const deleteColumn = (id) => {
    setData((prev) => {
      if(!prev) return prev;
      
      const colTasks = prev.columns[id]?.taskIds || [];
      const newTasks = { ...prev.tasks };
      colTasks.forEach(taskId => {
        delete newTasks[taskId];
      });

      const newColumns = { ...prev.columns };
      delete newColumns[id];
      
      const newColumnOrder = prev.columnOrder.filter(colId => colId !== id);
      
      return {
        ...prev,
        tasks: newTasks,
        columns: newColumns,
        columnOrder: newColumnOrder
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
    searchQuery,
    setSearchQuery,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    renameColumn,
    deleteColumn
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export const useTasks = () => useContext(TaskContext);
