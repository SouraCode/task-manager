import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // The entire Kanban state (tasks, columns, columnOrder)
    default: {
      tasks: {},
      columns: {
        "todo": { id: "todo", title: "To Do", taskIds: [] },
        "in-progress": { id: "in-progress", title: "In Progress", taskIds: [] },
        "completed": { id: "completed", title: "Done", taskIds: [] }
      },
      columnOrder: ["todo", "in-progress", "completed"]
    }
  }
}, { timestamps: true });

export default mongoose.model('Board', boardSchema);
