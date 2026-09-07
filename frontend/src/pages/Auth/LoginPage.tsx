import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, User, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const fillCredentials = (role: 'FRESHER' | 'STARTUP' | 'ADMIN') => {
    const creds = {
      FRESHER: { email: 'fresher@demo.com', pass: 'Password123!' },
      STARTUP: { email: 'startup@demo.com', pass: 'Password123!' },
      ADMIN: { email: 'admin@demo.com', pass: 'Password123!' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Handled in context toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'FRESHER' | 'STARTUP' | 'ADMIN') => {
    setIsLoading(true);
    try {
      await switchDemoRole(role);
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 selection:bg-sky-500/30 selection:text-sky-200 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 via-cyan-500 to-violet-600 p-0.5 shadow-glow-primary flex items-center justify-center">
              <div className="w-full h-full bg-[#050816] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 text-sm">
                  CP
                </span>
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Career<span className="text-sky-400">Pilot</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100">Sign in to your workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Access AI match intelligence & your ATS pipeline</p>
        </div>

        {/* Login Card */}
        <GlassCard className="p-6 sm:p-8 space-y-5 border-white/10">
          {/* Quick Fill Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium">Quick Fill Credentials:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillCredentials('FRESHER')}
                className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all text-center cursor-pointer"
              >
                🎓 Fresher
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('STARTUP')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all text-center cursor-pointer"
              >
                🚀 Startup
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('ADMIN')}
                className="px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-all text-center cursor-pointer"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            <Input
              label="Email Address"
              type="email"
              placeholder="fresher@demo.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* 1-Click Instant Demo Logins */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center">
              Instant 1-Click Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('FRESHER')}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-sky-500/20 text-xs font-semibold text-sky-300 flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-sky-400" />
                <span>Fresher</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('STARTUP')}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/20 text-xs font-semibold text-cyan-300 flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>Startup</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-violet-500/20 text-xs font-semibold text-violet-300 flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-violet-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </GlassCard>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
