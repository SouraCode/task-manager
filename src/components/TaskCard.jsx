import { Draggable } from "@hello-pangea/dnd";
import { Clock, Tag, MoreVertical, MessageSquare, Paperclip, CheckSquare } from "lucide-react";
import { format } from "date-fns";

export default function TaskCard({ task, index, onEdit }) {
  const isOverdue = new Date(task.dueDate) < new Date();

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl mb-4 glass-card hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col border ${
            snapshot.isDragging ? "shadow-2xl shadow-primary/30 rotate-2 z-50 border-primary/50" : "border-white/5"
          }`}
          style={provided.draggableProps.style}
        >
          {task.coverImage && (
            <div className="w-full h-32 overflow-hidden border-b border-white/5 shrink-0 bg-muted/20">
              <img 
                src={task.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          <div className="p-4 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-3">
              <span
                className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${
                  task.priority === "Urgent" || task.priority === "High"
                    ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400"
                    : task.priority === "Medium"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}
              >
                {task.priority}
              </span>
              <button 
                onClick={() => onEdit(task)}
                className="p-1 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:text-foreground"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2 leading-snug">
              {task.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {task.description}
            </p>

            {totalSubtasks > 0 && (
              <div className="mb-5">
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold mb-2 flex-row items-center">
                  <div className="flex items-center space-x-1.5 text-foreground/70">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Subtasks</span>
                  </div>
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
                <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                <div className={`flex items-center space-x-1 ${isOverdue ? "text-destructive font-semibold" : ""}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date(task.dueDate), "MMM d")}</span>
                </div>

                {(task.commentsCount > 0 || task.attachmentsCount > 0) && (
                  <div className="flex items-center space-x-2">
                    {task.commentsCount > 0 && (
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{task.commentsCount}</span>
                      </div>
                    )}
                    {task.attachmentsCount > 0 && (
                      <div className="flex items-center space-x-1">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{task.attachmentsCount}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {task.tags && task.tags.length > 0 && (
                  <div className="hidden sm:flex items-center space-x-1 text-[10px] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md text-muted-foreground">
                    <Tag className="w-3 h-3" />
                    <span className="truncate max-w-[60px]">{task.tags[0]}</span>
                    {task.tags.length > 1 && (
                      <span className="opacity-70">+{task.tags.length - 1}</span>
                    )}
                  </div>
                )}
                {task.assignee && (
                  <img 
                    src={task.assignee.avatarUrl} 
                    alt={task.assignee.name}
                    title={task.assignee.name}
                    className="w-7 h-7 rounded-full ring-2 ring-background object-cover bg-muted/30 shadow-sm border border-black/10 dark:border-white/10"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
