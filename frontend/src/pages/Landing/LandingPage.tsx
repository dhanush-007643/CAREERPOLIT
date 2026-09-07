import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  Layers,
  Award,
  ArrowRight,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  Bot,
  Compass,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { switchDemoRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Navbar */}
      <header className="h-20 px-6 max-w-7xl mx-auto flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-cyan-500 to-violet-600 p-0.5 shadow-glow-primary flex items-center justify-center">
            <div className="w-full h-full bg-[#050816] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                CP
              </span>
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Career<span className="text-sky-400">Pilot</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
              Smart Hiring Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-7xl mx-auto text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-violet-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold text-sky-300 mb-8 backdrop-blur-xl shadow-lg">
          <span className="text-violet-400">✦</span>
          <span>Next-Gen OOAD Recruitment & Career Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Where Ambitious Freshers Meet{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400">
            High-Growth Startups
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mt-6 leading-relaxed">
          AI-driven multi-attribute match scoring, live ATS recruitment pipelines, verified skill assessments, and dynamic career development roadmaps.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link to="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Create Free Account
            </Button>
          </Link>
          <button
            onClick={() => switchDemoRole('FRESHER')}
            className="px-6 py-3.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-base font-semibold transition-all cursor-pointer shadow-glow-ai flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-violet-400" /> Instant Demo (Fresher)
          </button>
          <button
            onClick={() => switchDemoRole('STARTUP')}
            className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 text-base font-semibold transition-all cursor-pointer flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-cyan-400" /> Instant Demo (Startup)
          </button>
        </div>

        {/* Feature Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-16 text-left">
          <div className="p-4 rounded-xl glass-panel border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">92% AI Match Engine</p>
              <p className="text-[10px] text-slate-400">Weighted 50/15/15/10/10</p>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">ATS Kanban Board</p>
              <p className="text-[10px] text-slate-400">Drag & drop pipelines</p>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Skill-Gap Roadmap</p>
              <p className="text-[10px] text-slate-400">Target role milestones</p>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Skill Assessments</p>
              <p className="text-[10px] text-slate-400">Automated verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400">
            Object-Oriented Analysis & Design
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Engineered for Modern Tech Recruitment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-md">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">For Tech Freshers</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Showcase verified projects, test skills in timed assessments, get transparent match scores for startup roles, and track ATS status in real-time.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2 text-emerald-400">✓ Resume Cloud Storage (Cloudinary)</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ Career Readiness Score (0-100%)</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ In-App Interview Scheduler</li>
            </ul>
          </GlassCard>

          <GlassCard variant="ai" className="space-y-4 border-violet-500/30">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/40 text-violet-300 flex items-center justify-center shadow-glow-ai">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">For Startups & Recruiters</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Eliminate resume screening fatigue with algorithmic candidate scoring, intuitive Kanban drag-and-drop pipeline, and 1-click invitations.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2 text-violet-300">✦ Instant AI Candidate Explanations</li>
              <li className="flex items-center gap-2 text-violet-300">✦ Full ATS Kanban Workflow</li>
              <li className="flex items-center gap-2 text-violet-300">✦ Public & Private Job Listings</li>
            </ul>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">For Platform Admins</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full governance over users, companies, active jobs, and comprehensive platform analytics with verified database security.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2 text-cyan-400">✓ Platform KPIs & Metrics</li>
              <li className="flex items-center gap-2 text-cyan-400">✓ User & Company Moderation</li>
              <li className="flex items-center gap-2 text-cyan-400">✓ System Health Telemetry</li>
            </ul>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 max-w-7xl mx-auto border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 CareerPilot Platform. Designed with OOAD Architecture.</p>
        <div className="flex items-center gap-4">
          <button onClick={() => switchDemoRole('FRESHER')} className="hover:text-sky-400 cursor-pointer">
            Demo Fresher
          </button>
          <span>•</span>
          <button onClick={() => switchDemoRole('STARTUP')} className="hover:text-cyan-400 cursor-pointer">
            Demo Startup
          </button>
          <span>•</span>
          <button onClick={() => switchDemoRole('ADMIN')} className="hover:text-violet-400 cursor-pointer">
            Demo Admin
          </button>
        </div>
      </footer>
    </div>
  );
};
