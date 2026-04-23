import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Toast from "./components/Toast";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";
import FocusMode from "./pages/FocusMode";
import CalendarView from "./pages/CalendarView";
import Settings from "./pages/Settings";

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <TaskProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<KanbanBoard />} />
                  <Route path="/focus" element={<FocusMode />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <Toast />
            </TaskProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
