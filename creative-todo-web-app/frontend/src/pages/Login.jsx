import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Call Laravel API
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      // Save Token & User Info
      localStorage.setItem("token", res.data.token);
      // Assuming API returns { token: "...", user: { is_admin: 1, ... } }
      // If your API structure is different, adjust this:
      if (res.data.user && res.data.user.is_admin) {
        localStorage.setItem("is_admin", "1");
        navigate("/admin");
      } else {
        localStorage.removeItem("is_admin"); // Ensure clean state
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-indigo-100 text-center mb-8">
          Login to manage your tasks
        </p>

        {error && (
          <div className="bg-red-500/80 text-white text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="text-white text-sm font-medium block mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-white text-sm font-medium block mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-indigo-600 font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-lg transform hover:scale-[1.02]"
          >
            Sign In
          </button>
        </form>

        {/* Footer Link (Optional) */}
        <div className="mt-6 text-center">
          <p className="text-indigo-200 text-sm">
            Don't have an account?{" "}
            <span 
                className="text-white font-bold cursor-pointer hover:underline"
                onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
