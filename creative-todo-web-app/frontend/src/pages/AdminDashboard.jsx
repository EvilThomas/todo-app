import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTodos, setUserTodos] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Basic check for admin status (could be more robust)
  useEffect(() => {
    const isAdmin = localStorage.getItem("is_admin") === "1";
    if (!isAdmin) {
      navigate("/");
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users. Ensure you are an admin.");
    }
  };

  const fetchUserTodos = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://127.0.0.1:8000/api/admin/users/${userId}/todos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserTodos(res.data);
      const user = users.find((u) => u.id === userId);
      setSelectedUser(user);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user tasks.");
    }
  };

  const deleteTodo = async (todoId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/admin/todos/${todoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh list
      setUserTodos(userTodos.filter((t) => t.id !== todoId));
      fetchUsers(); // Refresh user counts
    } catch (err) {
      console.error(err);
      setError("Failed to delete task.");
    }
  };

  const deleteUser = async (e, userId) => {
      e.stopPropagation(); // Prevent triggering row click
      if (!window.confirm("Are you sure you want to DELETE this user and all their data?")) return;

      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        setUsers(users.filter(u => u.id !== userId));
        if (selectedUser?.id === userId) {
            setSelectedUser(null);
            setUserTodos([]);
        }
      } catch (err) {
          console.error(err);
          setError("Failed to delete user.");
      }
  }

  const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("is_admin");
      navigate("/login");
  }

  // Helper for calendar
  const tileContent = ({ date, view }) => {
    if (view === "month" && selectedUser) {
      const dateStr = date.toISOString().split("T")[0];
      const hasTask = userTodos.some((t) => t.due_date === dateStr);
      return hasTask ? <div className="w-2 h-2 bg-indigo-500 rounded-full mx-auto mt-1"></div> : null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">Admin Dashboard</h1>
            <button 
                onClick={handleLogout}
                className="btn btn-light btn-sm fw-bold text-indigo-600 shadow-md transition-transform hover:scale-105"
            >
                Logout
            </button>
        </header>

        {error && (
          <div className="bg-red-500/80 text-white px-4 py-3 rounded-xl mb-6 text-center shadow-lg border border-red-400/50">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Users List */}
          <div className="md:col-span-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-6 h-fit max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">Users</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => fetchUserTodos(user.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border relative group ${
                    selectedUser?.id === user.id 
                        ? "bg-white/40 border-white/60 shadow-inner" 
                        : "bg-white/10 border-white/20 hover:bg-white/20 hover:scale-[1.02]"
                  }`}
                >
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-xs text-indigo-100 break-all">{user.email}</p>
                  <p className="text-xs text-indigo-200 mt-1">{user.todos_count} Tasks</p>
                  
                  {user.is_admin ? (
                       <span className="absolute top-3 right-3 text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold shadow-sm">ADMIN</span>
                  ) : (
                      <button 
                        onClick={(e) => deleteUser(e, user.id)}
                        className="absolute top-3 right-3 text-red-300 hover:text-red-500 transition-colors p-1"
                        title="Delete User"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                      </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="md:col-span-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-6 h-fit min-h-[500px]">
            {selectedUser ? (
              <>
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-2">
                  Tasks for <span className="text-indigo-200">{selectedUser.name}</span>
                </h2>
                {userTodos.length === 0 ? (
                  <p className="text-white/60 italic text-center mt-10">No tasks found for this user.</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {userTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition"
                      >
                        <div>
                            <p className={`text-lg font-medium ${todo.is_completed ? 'line-through text-white/50' : 'text-white'}`}>
                                {todo.title}
                            </p>
                            <div className="flex gap-3 text-xs text-indigo-100 mt-1">
                                <span>Created: {new Date(todo.created_at).toLocaleDateString()}</span>
                                {(todo.due_date || todo.due_time) && (
                                    <span className="text-yellow-200 font-semibold flex items-center gap-1">
                                        ⏰ {todo.due_date} {todo.due_time}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-300 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                          title="Delete Task"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-lg">Select a user to view their tasks</p>
                </div>
            )}
          </div>

          {/* Calendar View */}
          <div className="md:col-span-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-6 h-fit">
              <h2 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">Calendar</h2>
              <div className="bg-white/90 p-2 rounded-xl shadow-inner">
                  <Calendar 
                    tileContent={tileContent}
                    className="border-0 w-full text-sm rounded-lg" 
                  />
              </div>
              <p className="text-xs text-indigo-100 mt-4 text-center">
                  {selectedUser ? `Showing tasks for ${selectedUser.name}` : "Select a user to filter calendar"}
              </p>
          </div>

        </div>
      </div>
    </div>
  );
}
