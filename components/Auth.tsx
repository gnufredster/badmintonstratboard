import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Mock successful login/signup
      onLogin({
        email,
        name: name || email.split('@')[0],
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d120f] relative overflow-hidden p-4">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
           backgroundImage: `linear-gradient(rgba(54, 226, 123, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(54, 226, 123, 0.05) 1px, transparent 1px)`,
           backgroundSize: '40px 40px'
        }}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-sidebar-dark border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="p-8 pb-0 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary border border-primary/20">
            <span className="material-symbols-outlined text-4xl">sports_tennis</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white/40 text-sm text-center">
            {isLogin ? 'Enter your credentials to access your tactics.' : 'Sign up to start building your badminton strategies.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {!isLogin && (
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#9eb7a8] uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1c2620] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder-white/20"
                  placeholder="John Doe"
                  required
                />
             </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#9eb7a8] uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1c2620] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder-white/20"
              placeholder="coach@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#9eb7a8] uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1c2620] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder-white/20"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-sidebar-dark font-bold py-4 rounded-xl mt-6 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="p-6 bg-white/5 border-t border-white/5 text-center">
          <p className="text-sm text-white/50">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};