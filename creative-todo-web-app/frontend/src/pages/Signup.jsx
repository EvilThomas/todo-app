import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Call Laravel API
      const res = await axios.post("http://127.0.0.1:8000/api/register", {
        name,
        email,
        password,
      });

      // Save Token & User Info
      // The register endpoint returns { access_token: "...", token_type: "Bearer" }
      // But we might want to store user info if returned, or just token.
      // Based on AuthController: 
      // return response()->json([
      //     'access_token' => $token,
      //     'token_type' => 'Bearer',
      // ]);
      
      // Note: key is 'access_token' here, but 'token' in login. 
      // We should probably normalize or just handle both. 
      // Dashboard uses 'token'.
      
      localStorage.setItem("token", res.data.access_token);
      
      // We don't get user object back in register response current implementation of AuthController.
      // So isAdmin might be undefined. That's fine for new users (usually not admins).
      
      // Redirect to Dashboard
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
      } else {
          setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h2>
        <p className="text-indigo-100 text-center mb-8">
          Join us and get organized
        </p>

        {error && (
          <div className="bg-red-500/80 text-white text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="text-white text-sm font-medium block mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              minLength={8}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-indigo-600 font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-lg transform hover:scale-[1.02]"
          >
            Sign Up
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-indigo-200 text-sm">
            Already have an account?{" "}
            <span 
                className="text-white font-bold cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
