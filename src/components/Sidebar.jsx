import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Settings as SettingsIcon, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Kanban Board", path: "/tasks", icon: <CheckSquare className="w-5 h-5" /> },
    { name: "Settings", path: "/settings", icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 h-screen hidden md:flex flex-col border-r border-white/10 glass">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <CheckSquare className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          Taskify
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-black/20"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={logout}
          className="flex items-center space-x-3 text-muted-foreground hover:text-destructive transition-colors px-4 py-3 w-full rounded-xl hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
