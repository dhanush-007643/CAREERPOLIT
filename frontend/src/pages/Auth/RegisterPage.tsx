import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, MapPin, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('FRESHER');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        companyName: role === 'STARTUP' ? (companyName.trim() || `${name.trim()}'s Startup`) : undefined,
        industry: role === 'STARTUP' ? (industry.trim() || 'Technology') : undefined,
        location: location.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      const targetUrl = (import.meta as any).env?.VITE_API_URL || '(default: /api)';
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details?.[0]?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? `Cannot connect to backend server at "${targetUrl}". Please verify your Render service is active and VITE_API_URL in Vercel is set to your Render URL + /api.`
          : 'Registration failed. Please check your details.');
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 selection:bg-sky-500/30 selection:text-sky-200 relative overflow-hidden py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
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
          <h2 className="text-xl font-bold text-slate-100">Create your CareerPilot account</h2>
          <p className="text-xs text-slate-400 mt-1">Select your role to configure tailored workspaces</p>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-5 border-white/10">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-200">Registration Error</p>
                <p className="text-[11px] text-red-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Role selector tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
              I want to join as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('FRESHER');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'FRESHER'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm'
                    : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Tech Fresher / Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('STARTUP');
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'STARTUP'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Startup / Recruiter</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder={role === 'STARTUP' ? 'e.g. Sarah Connor (Hiring Lead)' : 'e.g. Alex Johnson'}
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Location (Optional)"
              type="text"
              placeholder="e.g. San Francisco, CA / Bengaluru / Remote"
              leftIcon={<MapPin className="w-4 h-4" />}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            {role === 'STARTUP' && (
              <>
                <Input
                  label="Company Name"
                  type="text"
                  placeholder="e.g. TechPulse Innovations"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />

                <Input
                  label="Industry (Optional)"
                  type="text"
                  placeholder="e.g. AI & Cloud Infrastructure"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-3"
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>
        </GlassCard>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
