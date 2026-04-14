import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Moon, Sun, Monitor, LogOut, CheckSquare, Trash2, XCircle } from "lucide-react";
import { useTasks } from "../context/TaskContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout, token } = useAuth();
  const { setData } = useTasks();

  const handleResetData = async () => {
    if (confirm("Are you sure you want to reset all your tasks? This cannot be undone.")) {
      try {
        const res = await fetch("/api/board/reset", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const freshData = await res.json();
          setData(freshData);
          alert("All tasks have been reset successfully.");
        }
      } catch (err) {
        console.error("Failed to reset tasks", err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and app settings.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors border border-destructive/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </motion.div>

        {/* Appearance Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
             <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
             </div>
             <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-12 h-6 rounded-full bg-black/10 dark:bg-white/10 relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center absolute top-0.5 left-0.5"
                  animate={{ x: theme === "dark" ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {theme === "dark" ? (
                    <Moon className="w-3 h-3 text-black" />
                  ) : (
                    <Sun className="w-3 h-3 text-black" />
                  )}
                </motion.div>
              </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 border border-red-500/20 bg-red-500/5"
        >
          <h2 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h2>
          
          <div className="flex items-center justify-between">
             <div>
                <p className="font-medium text-foreground">Reset All Tasks</p>
                <p className="text-sm text-muted-foreground">This will permanently delete all your boards and tasks.</p>
             </div>
             <button
                onClick={handleResetData}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Data</span>
              </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
