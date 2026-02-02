import { useState } from "react";

export default function EditTaskModal({ todo, onClose, onUpdate, categories = [] }) {
  const [title, setTitle] = useState(todo.title);
  const [dueDate, setDueDate] = useState(todo.due_date || "");
  const [dueTime, setDueTime] = useState(todo.due_time || "");
  const [selectedCategory, setSelectedCategory] = useState(todo.category_id || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onUpdate(todo.id, {
        title,
        due_date: dueDate,
        due_time: dueTime,
        category_id: selectedCategory || null
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/50 p-6 relative animate-slide-up">
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Task ✏️</h2>
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl transition-colors"
            >
                ✕
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
                    <input
                        type="text"
                        className="form-control w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg"
                        placeholder="Task title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                        <input 
                            type="date" 
                            className="form-control w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                        <input 
                            type="time" 
                            className="form-control w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select
                        className="form-control w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">No Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3 mt-6 pt-2">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
