import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';


interface AuthProps {
  onLogin: (userData: any) => void;
}

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;


const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(
        `${API_URL}/${isLogin ? "login" : "signup"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isLogin
              ? { email, password }
              : { name, email, password }
          )
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Something went wrong");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        onLogin({ userId: data.userId, email });
      } else {
        alert("Signup successful! Please login.");
        setIsLogin(true);
      }

    } catch {
      setError("Server not connected");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617]">
      <div className="w-full max-w-md space-y-8">

        <h1 className="text-4xl font-black text-white text-center">Sonia AI</h1>

        <div className="glass-card p-8 rounded-[2.5rem]">

          <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl ${isLogin ? "bg-indigo-500 text-white" : "text-slate-400"}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl ${!isLogin ? "bg-indigo-500 text-white" : "text-slate-400"}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center mb-3">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {!isLogin && (
              <input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 text-white"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 text-white"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 text-white"
              required
            />

            <button
              type="submit"
              className="w-full py-4 bg-indigo-500 rounded-xl text-white flex justify-center items-center gap-2"
            >
              {isLogin ? "Login" : "Create Account"}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div className="flex justify-center gap-2 opacity-50">
          <ShieldCheck size={16} />
          <span className="text-xs text-slate-400">Secure Login</span>
        </div>

      </div>
    </div>
  );
};

export default Auth;
