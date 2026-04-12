import { useTasks } from "../context/TaskContext";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data } = useTasks();

  const totalTasks = Object.keys(data.tasks).length;
  const completedTasks = data.columns.completed.taskIds.length;
  const inProgressTasks = data.columns['in-progress'].taskIds.length;
  const pendingTasks = data.columns.todo.taskIds.length;

  const chartData = [
    { name: "To Do", count: pendingTasks },
    { name: "In Progress", count: inProgressTasks },
    { name: "Completed", count: completedTasks },
  ];

  const statCards = [
    { title: "Total Tasks", value: totalTasks, icon: <AlertCircle className="w-6 h-6 text-blue-500" /> },
    { title: "In Progress", value: inProgressTasks, icon: <Clock className="w-6 h-6 text-orange-500" /> },
    { title: "Completed", value: completedTasks, icon: <CheckCircle className="w-6 h-6 text-green-500" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Here's a summary of your tasks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h2 className="text-4xl font-bold text-foreground mt-2">{stat.value}</h2>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-full border border-white/10">
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-2xl h-[400px]">
        <h3 className="text-lg font-semibold mb-6">Task Distribution</h3>
        <ResponsiveContainer w="100%" h="100%" width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
