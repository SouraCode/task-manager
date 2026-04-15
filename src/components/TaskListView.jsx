import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpDown, Edit2, Trash2, Tag, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function TaskListView({ tasks, onEdit, onDelete }) {
  const [sortConfig, setSortConfig] = useState({ key: "dueDate", direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const priorityWeight = { "Urgent": 4, "High": 3, "Medium": 2, "Low": 1 };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortConfig.key === "priority") {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      return sortConfig.direction === "asc" ? weightA - weightB : weightB - weightA;
    }
    if (sortConfig.key === "dueDate") {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full overflow-x-auto glass-card rounded-2xl border border-white/5">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-muted-foreground text-sm">
            <th className="p-4 font-medium">Task / Title</th>
            <th 
              className="p-4 font-medium cursor-pointer hover:bg-white/5 hover:text-foreground transition-colors group"
              onClick={() => handleSort("priority")}
            >
              <div className="flex items-center gap-2">
                Priority
                <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </th>
            <th 
              className="p-4 font-medium cursor-pointer hover:bg-white/5 hover:text-foreground transition-colors group"
              onClick={() => handleSort("dueDate")}
            >
              <div className="flex items-center gap-2">
                Due Date
                <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </th>
            <th className="p-4 font-medium">Tags</th>
            <th className="p-4 font-medium">Assignee</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
            return (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={task.id} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground line-clamp-1">{task.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1 mt-1">{task.description}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md inline-block ${
                      task.priority === "Urgent" || task.priority === "High"
                        ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400"
                        : task.priority === "Medium"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-sm ${isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 flex-wrap">
                    {task.tags?.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-black/5 dark:bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-muted-foreground flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  {task.assignee ? (
                    <img 
                      src={task.assignee.avatarUrl} 
                      alt={task.assignee.name}
                      title={task.assignee.name}
                      className="w-8 h-8 rounded-full ring-2 ring-background object-cover bg-muted/30 border border-white/10"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Unassigned</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(task)}
                      className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-md transition-all"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(task.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
          {sortedTasks.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
