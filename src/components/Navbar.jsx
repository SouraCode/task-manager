import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useTasks();

  return (
    <header className="h-16 border-b border-white/10 glass px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center sm:hidden">
        <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/5 rounded-full px-4 py-2 w-96 border border-white/10">
        <Search className="w-4 h-4 text-muted-foreground mr-2" />
        <input 
          type="text" 
          placeholder="Search tasks..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <Link to="/settings" className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent border-2 border-white/20 overflow-hidden cursor-pointer shadow-md hover:scale-105 transition-transform">
          <img src={`https://ui-avatars.com/api/?name=${user?.email || "User"}&background=random`} alt="User" />
        </Link>
      </div>
    </header>
  );
}
