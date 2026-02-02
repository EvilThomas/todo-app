import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import AdminDashboard from "./pages/AdminDashboard";

// ProtectedRoute Component to handle dynamic auth checks
const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "1";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If route is Admin only and user is NOT admin -> Redirect to User Dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If route is User only and user IS admin -> Redirect to Admin Dashboard
  if (userOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Route wrapper to redirect authenticated users away from public pages like Login/Signup
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "1";

  if (token) {
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* User Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute userOnly={true}>
               <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Public Routes (Login/Signup) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
