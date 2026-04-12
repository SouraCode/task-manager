import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, perform auth here.
    if (email && password) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background text-foreground p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 blur-3xl -z-10 rounded-full" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Welcome to Taskify
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to manage your tasks</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between mt-2 mb-6">
            <label className="flex items-center space-x-2 text-sm text-muted-foreground">
              <input type="checkbox" className="rounded border-white/10 bg-black/5" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Forgot info?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <a href="#" className="text-primary hover:underline">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
}
