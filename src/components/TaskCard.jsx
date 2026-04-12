import { Draggable } from "@hello-pangea/dnd";
import { Clock, Tag, MoreVertical } from "lucide-react";
import { format } from "date-fns";

export default function TaskCard({ task, index, onEdit }) {
  const isOverdue = new Date(task.dueDate) < new Date();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 rounded-xl mb-3 glass-card hover:-translate-y-1 transition-transform group relative ${
            snapshot.isDragging ? "shadow-2xl shadow-primary/20 rotate-2 z-50" : ""
          }`}
          style={provided.draggableProps.style}
        >
          <div className="flex justify-between items-start mb-2">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-md ${
                task.priority === "High"
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
              className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
            {task.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span className={isOverdue ? "text-destructive font-medium" : ""}>
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            </div>
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>{task.tags[0]}</span>
                {task.tags.length > 1 && (
                  <span className="bg-black/10 dark:bg-white/10 rounded-full px-1.5 py-0.5 text-[10px]">
                    +{task.tags.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
