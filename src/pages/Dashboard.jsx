import { useTasks } from "../context/TaskContext";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data, isLoading } = useTasks();

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-muted-foreground font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const totalTasks = Object.keys(data.tasks || {}).length;
  const completedTasks = data.columns?.completed?.taskIds?.length || 0;
  const inProgressTasks = data.columns?.['in-progress']?.taskIds?.length || 0;
  const pendingTasks = data.columns?.todo?.taskIds?.length || 0;

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

  // Calculate priority breakdown
  const tasksArray = Object.values(data.tasks || {});
  const highPriority = tasksArray.filter(t => t.priority === "High" || t.priority === "Urgent").length;
  const mediumPriority = tasksArray.filter(t => t.priority === "Medium").length;
  const lowPriority = tasksArray.filter(t => t.priority === "Low").length;

  const priorityData = [
    { name: "High/Urgent", value: highPriority, color: "hsl(var(--destructive))" },
    { name: "Medium", value: mediumPriority, color: "#f97316" }, // orange-500
    { name: "Low", value: lowPriority, color: "#3b82f6" }, // blue-500
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Task Distribution</h3>
          <div className="flex-1 min-h-0">
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
        </div>

        <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Priority Breakdown</h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-2xl font-bold">{totalTasks}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Tasks</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
