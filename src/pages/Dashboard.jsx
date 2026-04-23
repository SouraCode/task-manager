import { useTasks } from "../context/TaskContext";
import { CheckCircle, Clock, AlertCircle, Target, Zap, Activity, Timer } from "lucide-react";
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

  const tasksArray = Object.values(data.tasks || {});
  const totalTasks = tasksArray.length;
  const completedTasks = data.columns?.completed?.taskIds?.length || 0;
  const inProgressTasks = data.columns?.['in-progress']?.taskIds?.length || 0;
  const pendingTasks = data.columns?.todo?.taskIds?.length || 0;

  // Calculate Productivity Score
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const productivityScore = Math.round(completionRate);

  const chartData = [
    { name: "To Do", count: pendingTasks },
    { name: "In Progress", count: inProgressTasks },
    { name: "Completed", count: completedTasks },
  ];

  const statCards = [
    { title: "Total Tasks", value: totalTasks, icon: <AlertCircle className="w-6 h-6 text-blue-500" />, delay: 0 },
    { title: "In Progress", value: inProgressTasks, icon: <Clock className="w-6 h-6 text-orange-500" />, delay: 0.1 },
    { title: "Completed", value: completedTasks, icon: <CheckCircle className="w-6 h-6 text-green-500" />, delay: 0.2 },
  ];

  // Time stats
  const totalEstimatedHours = tasksArray.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  
  // Priority breakdown
  const highPriority = tasksArray.filter(t => t.priority === "High" || t.priority === "Urgent").length;
  const mediumPriority = tasksArray.filter(t => t.priority === "Medium").length;
  const lowPriority = tasksArray.filter(t => t.priority === "Low").length;

  const priorityData = [
    { name: "High/Urgent", value: highPriority, color: "hsl(var(--destructive))" },
    { name: "Medium", value: mediumPriority, color: "#f97316" },
    { name: "Low", value: lowPriority, color: "#3b82f6" },
  ];

  // Mock activity feed based on existing tasks
  const activityFeed = tasksArray
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: `Created task: ${t.title}`,
      time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Recently",
      type: 'create'
    }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Your productivity at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            className="glass-card p-6 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h2 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h2>
            </div>
            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-full border border-white/10">
              {stat.icon}
            </div>
          </motion.div>
        ))}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl flex items-center justify-between bg-primary/5 border-primary/20"
        >
          <div>
            <p className="text-sm font-medium text-primary">Productivity</p>
            <h2 className="text-3xl font-bold text-foreground mt-2">{productivityScore}%</h2>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full rotate-[-90deg]">
               <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/10" />
               <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * productivityScore) / 100} className="text-primary transition-all duration-1000" />
            </svg>
            <Zap className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Task Distribution
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" /> Time Tracking
          </h3>
          <div className="flex-1 space-y-6">
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-white/5">
              <p className="text-sm text-muted-foreground">Estimated Total</p>
              <p className="text-3xl font-bold mt-1">{totalEstimatedHours} <span className="text-sm font-normal text-muted-foreground">hours</span></p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion Progress</span>
                <span className="font-medium">{productivityScore}%</span>
              </div>
              <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${productivityScore}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
               <h4 className="text-sm font-medium text-muted-foreground mb-4">Recent Activity</h4>
               <div className="space-y-4">
                  {activityFeed.length > 0 ? activityFeed.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                         <Target className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="glass-card p-6 rounded-2xl h-[350px] flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Priority Breakdown</h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-2xl font-bold">{totalTasks}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border-primary/20 flex flex-col justify-center items-center text-center">
            <Zap className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to focus?</h3>
            <p className="text-muted-foreground text-sm max-w-[300px] mb-6">
              Use the Pomodoro timer to stay productive and track your focus sessions.
            </p>
            <a 
              href="/focus" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-all"
            >
              Start Focus Session
            </a>
        </div>
      </div>
    </motion.div>
  );
}
