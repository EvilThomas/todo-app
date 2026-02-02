import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import EditTaskModal from "../components/EditTaskModal";

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(""); // YYYY-MM-DD
  const [dueTime, setDueTime] = useState(""); // HH:MM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#4f46e5"); // Default Indigo

  const [editingTodo, setEditingTodo] = useState(null); // State for modal
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, completed
  const [filterCategory, setFilterCategory] = useState("");

  const navigate = useNavigate();

  // API Base URL
  const API_URL = "http://127.0.0.1:8000/api/todos";
  const CAT_URL = "http://127.0.0.1:8000/api/categories";
  const NOTIF_URL = "http://127.0.0.1:8000/api/notifications";

  // check if user is admin (assuming you saved this during login)
  const isAdmin = localStorage.getItem("is_admin") === "1";

  // --- API OPERATIONS ---

  const fetchTodos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Redirect if not logged in
        return;
      }

      const res = await axios.get(API_URL, {
        params: {
            search: search,
            is_completed: filterStatus === "all" ? undefined : (filterStatus === "completed" ? "true" : "false"),
            category_id: filterCategory || undefined
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks.");
      setLoading(false);
    }
  }, [navigate, API_URL]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const delayDebounceFn = setTimeout(() => {
      fetchTodos();
    }, 300); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [fetchTodos, search, filterStatus, filterCategory]);

  useEffect(() => {
    fetchCategories();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(NOTIF_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
    } catch {
        // silent fail
    }
  };

  const markAsRead = async (id) => {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`${NOTIF_URL}/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(notifications.filter(n => n.id !== id));
      } catch {
          //
      }
  };

  const fetchCategories = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(CAT_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
    } catch {
        // Silent fail or log
    }
  };

  const addCategory = async (e) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(CAT_URL, {
            name: newCategoryName,
            color: newCategoryColor
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        setCategories([...categories, res.data]);
        setNewCategoryName("");
      } catch {
          alert("Error creating category");
      }
  }

  const deleteCategory = async (id) => {
      if (!window.confirm("Delete this category? Tasks will remain but lose the tag.")) return;
       try {
        const token = localStorage.getItem("token");
        await axios.delete(`${CAT_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(categories.filter(c => c.id !== id));
      } catch {
          alert("Error deleting category");
      }
  }

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        API_URL,
        { 
            title: title,
            due_date: dueDate,
            due_time: dueTime,
            category_id: selectedCategory || null
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Add new todo to top of list
      setTodos([res.data, ...todos]);
      setTitle("");
      setDueDate("");
      setDueTime("");
      setSelectedCategory("");
    } catch {
      alert("Error adding task");
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      // Optimistic UI Update (update UI before API responds for speed)
      const updatedTodos = todos.map((t) =>
        t.id === id ? { ...t, is_completed: !currentStatus } : t,
      );
      setTodos(updatedTodos);

      await axios.put(
        `${API_URL}/${id}`,
        { is_completed: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      alert("Error updating task");
      fetchTodos(); // Revert on error
    }
  };

  const updateTodo = async (id, updatedData) => {
    try {
        const token = localStorage.getItem("token");
        // Optimistic Update
        setTodos(todos.map(t => t.id === id ? { ...t, ...updatedData } : t));

        await axios.put(
            `${API_URL}/${id}`,
            updatedData,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch (err) {
        console.error(err);
        alert("Failed to update task details");
        fetchTodos(); 
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(todos.filter((t) => t.id !== id));
    } catch {
      alert("Error deleting task");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Helper to check if a date has tasks
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      const hasTask = todos.some((t) => t.due_date === dateStr);
      return hasTask ? <div className="w-2 h-2 bg-indigo-500 rounded-full mx-auto mt-1"></div> : null;
    }
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-5xl bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN: Tasks */}
        <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-md">My Tasks</h1>
                    <p className="text-indigo-100 text-sm">Let's get things done today.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button 
                            className="bg-white/20 p-2 rounded-full text-white hover:bg-white/30 transition relative"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            🔔
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
                                <div className="p-2 border-b flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-700">Notifications</h3>
                                    {notifications.length === 0 && <span className="text-xs text-gray-500">None</span>}
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {notifications.map(n => (
                                        <div 
                                            key={n.id} 
                                            className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <p className="text-xs text-indigo-600 font-bold mb-1">Due Soon!</p>
                                            <p className="text-sm text-gray-800">{n.data.message}</p>
                                            <span className="text-xs text-gray-400 block mt-1">{new Date(n.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                    {notifications.length === 0 && (
                                        <div className="p-4 text-center text-gray-400 text-sm">
                                            No new notifications 🎉
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <button onClick={handleLogout} className="btn btn-light btn-sm fw-bold text-indigo-600 shadow-md">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-6 flex flex-col md:flex-row gap-3 shadow-lg border border-white/20">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-indigo-200">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search tasks..." 
                        className="w-full bg-white/20 border border-white/30 rounded-lg py-2 pl-9 pr-3 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/30 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-white/20 border border-white/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:bg-white/30 cursor-pointer text-indigo-900"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all" className="text-gray-800">All Status</option>
                    <option value="pending" className="text-gray-800">Pending</option>
                    <option value="completed" className="text-gray-800">Completed</option>
                </select>
                <select 
                    className="bg-white/20 border border-white/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:bg-white/30 cursor-pointer text-indigo-900"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="" className="text-gray-800">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="text-gray-800">{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Input Form */}
            <form onSubmit={addTodo} className="bg-white/30 p-4 rounded-xl shadow-lg mb-6 space-y-3">
                <input
                    type="text"
                    className="form-control border-0 p-3 rounded-lg w-full text-lg"
                    placeholder="Task title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <div className="flex gap-2">
                    <input 
                        type="date" 
                        className="form-control border-0 p-2 rounded-lg w-full"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                    <input 
                        type="time" 
                        className="form-control border-0 p-2 rounded-lg w-full"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="form-control border-0 p-2 rounded-lg w-full"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">No Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="w-full btn btn-primary font-bold py-2 rounded-lg transition-all hover:bg-indigo-700 shadow-md">
                    ADD TASK +
                </button>
            </form>

            {/* Category Manager (Mini) */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <form onSubmit={addCategory} className="flex gap-2 min-w-max">
                    <input 
                        type="text" 
                        placeholder="New Tag..." 
                        className="p-1 px-3 rounded-full text-sm border-0 shadow-sm"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)} 
                    />
                    <input 
                        type="color" 
                        className="w-8 h-7 rounded-full overflow-hidden border-0 cursor-pointer p-0"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                    />
                    <button type="submit" className="bg-white/80 w-7 h-7 rounded-full flex items-center justify-center shadow-sm font-bold text-indigo-600">+</button>
                </form>
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white shadow-sm whitespace-nowrap" style={{ backgroundColor: cat.color }}>
                        {cat.name}
                        <button onClick={() => deleteCategory(cat.id)} className="ml-1 opacity-70 hover:opacity-100">×</button>
                    </div>
                ))}
            </div>

            {/* Todo List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {loading && <p className="text-white text-center">Loading...</p>}
            {!loading && todos.length === 0 && (
                <p className="text-white/70 text-center py-10">No tasks yet. Add one above! ✨</p>
            )}
            
            {todos.map((todo) => (
                <div key={todo.id} className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                    todo.is_completed ? "bg-green-500/20 border border-green-400/30" : "bg-white/40 border border-white/40 hover:bg-white/60"
                }`}>
                    <div className="flex items-center gap-3 cursor-pointer flex-grow" onClick={() => toggleTodo(todo.id, todo.is_completed)}>
                        <div className={`min-w-[20px] w-5 h-5 rounded-full border-2 flex items-center justify-center ${todo.is_completed ? "bg-green-400 border-green-400" : "border-white/70"}`}>
                            {todo.is_completed && <span className="text-white text-[10px]">✔</span>}
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-medium text-white break-all ${todo.is_completed ? "line-through opacity-70" : ""}`}>
                                {todo.title}
                            </span>
                            {(todo.due_date || todo.due_time) && (
                                <span className="text-xs text-indigo-100 flex items-center gap-1">
                                    ⏰ {todo.due_date} {todo.due_time}
                                </span>

                            )}
                            {todo.category && (
                                <span 
                                    className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold ml-0 mt-1 w-fit shadow-sm"
                                    style={{ backgroundColor: todo.category.color }}
                                >
                                    {todo.category.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setEditingTodo(todo)}
                            className="text-indigo-200 hover:text-white font-bold p-2 transition-colors text-lg"
                            title="Edit Task"
                        >
                            ✎
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} className="text-red-200 hover:text-red-500 font-bold px-2 transition-colors">
                            ✕
                        </button>
                    </div>
                </div>
            ))}
            </div>
        </div>

        {/* RIGHT COLUMN: Calendar */}
        <div className="md:w-1/3 flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-4">Calendar</h2>
            <div className="bg-white rounded-xl shadow-lg p-2 w-full">
                <Calendar 
                    tileContent={tileContent}
                    className="border-0 w-full text-indigo-900" 
                />
            </div>
            
            <div className="mt-6 bg-white/10 rounded-xl p-4 w-full">
                <h3 className="text-white font-semibold mb-2 text-sm">Stats</h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white/20 rounded p-2">
                        <span className="block text-2xl font-bold text-white">{todos.filter(t => !t.is_completed).length}</span>
                        <span className="text-xs text-indigo-100">Pending</span>
                    </div>
                    <div className="bg-green-500/20 rounded p-2">
                        <span className="block text-2xl font-bold text-white">{todos.filter(t => t.is_completed).length}</span>
                        <span className="text-xs text-green-100">Done</span>
                    </div>
                </div>
            </div>
        </div>

      </div>


      {editingTodo && (
        <EditTaskModal 
            todo={editingTodo}
            onClose={() => setEditingTodo(null)}
            onUpdate={updateTodo}
            categories={categories}
        />
      )}
    </div>
  );
}
