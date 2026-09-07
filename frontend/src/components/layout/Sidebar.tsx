import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Sparkles,
  FileText,
  Compass,
  Award,
  Users,
  Send,
  Calendar,
  BarChart3,
  Settings,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  LayoutDashboard,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  isAi?: boolean;
}

export const Sidebar: React.FC = () => {
  const { role, user, switchDemoRole } = useAuth();

  const getFresherNav = (): NavItem[] => [
    { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Jobs', path: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Companies', path: '/companies', icon: <Building2 className="w-4 h-4" /> },
    { label: 'AI Matching', path: '/matching', icon: <Sparkles className="w-4 h-4 text-violet-400" />, isAi: true },
    { label: 'Applications', path: '/applications', icon: <FileText className="w-4 h-4" /> },
    { label: 'Career Development', path: '/career', icon: <Compass className="w-4 h-4" /> },
    { label: 'Assessments', path: '/assessments', icon: <Award className="w-4 h-4" /> },
    { label: 'Invitations', path: '/invitations', icon: <Send className="w-4 h-4" /> },
    { label: 'Interviews', path: '/interviews', icon: <Calendar className="w-4 h-4" /> },
  ];

  const getStartupNav = (): NavItem[] => [
    { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Jobs', path: '/startup/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Post New Job', path: '/startup/post-job', icon: <PlusCircle className="w-4 h-4 text-sky-400" /> },
    { label: 'Candidates', path: '/startup/candidates', icon: <Users className="w-4 h-4" /> },
    { label: 'AI Matching', path: '/startup/matching', icon: <Sparkles className="w-4 h-4 text-violet-400" />, isAi: true },
    { label: 'Recruitment Pipeline', path: '/startup/ats', icon: <Layers className="w-4 h-4 text-cyan-400" /> },
    { label: 'Invitations', path: '/startup/invitations', icon: <Send className="w-4 h-4" /> },
    { label: 'Interviews', path: '/startup/interviews', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Hiring Analytics', path: '/startup/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Company Profile', path: '/startup/profile', icon: <Building2 className="w-4 h-4" /> },
  ];

  const getAdminNav = (): NavItem[] => [
    { label: 'Dashboard', path: '/admin', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Users', path: '/admin/users', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Companies', path: '/admin/companies', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Jobs', path: '/admin/jobs', icon: <Briefcase className="w-4 h-4" /> },
  ];

  const items = role === 'STARTUP' ? getStartupNav() : role === 'ADMIN' ? getAdminNav() : getFresherNav();

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col h-screen sticky top-0 bg-[#07111F]/80 backdrop-blur-2xl border-r border-white/10 z-40">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 via-cyan-500 to-violet-600 p-0.5 shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/35 transition-shadow flex items-center justify-center">
            <div className="w-full h-full bg-[#050816] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 text-sm">
                CP
              </span>
            </div>
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
              Career<span className="text-sky-400">Pilot</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
              Smart Hiring
            </span>
          </div>
        </NavLink>
        <Badge variant={role === 'STARTUP' ? 'secondary' : role === 'ADMIN' ? 'ai' : 'primary'} size="sm">
          {role}
        </Badge>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group',
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )
            }
          >
            <span className="shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
            <span className="truncate">{item.label}</span>
            {item.isAi && (
              <span className="ml-auto text-[10px] font-bold text-violet-400 bg-violet-500/20 px-1.5 py-0.2 rounded border border-violet-500/30">
                ✦ AI
              </span>
            )}
          </NavLink>
        ))}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Account & Support
        </div>
        {role === 'FRESHER' && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )
            }
          >
            <Users className="w-4 h-4" />
            <span>My Profile</span>
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
              isActive
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
        <NavLink
          to="/help"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
              isActive
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )
          }
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help Center</span>
        </NavLink>
      </div>

      {/* Demo Persona Switcher Footer */}
      <div className="p-3 border-t border-white/5 bg-slate-950/40">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1.5">
            <span>DEMO PERSONA SWITCH</span>
            <span className="text-violet-400 font-bold">1-Click</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => switchDemoRole('FRESHER')}
              className={cn(
                'px-1.5 py-1 rounded text-[10px] font-bold transition-colors',
                role === 'FRESHER' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              Fresher
            </button>
            <button
              onClick={() => switchDemoRole('STARTUP')}
              className={cn(
                'px-1.5 py-1 rounded text-[10px] font-bold transition-colors',
                role === 'STARTUP' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              Startup
            </button>
            <button
              onClick={() => switchDemoRole('ADMIN')}
              className={cn(
                'px-1.5 py-1 rounded text-[10px] font-bold transition-colors',
                role === 'ADMIN' ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              Admin
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 mt-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-violet-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'CareerPilot User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
