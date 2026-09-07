import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';
import { X, LayoutDashboard, Briefcase, Building2, Sparkles, FileText, Compass, Award, Send, Calendar, Users, BarChart3, Settings, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role } = useAuth();

  const getNavLinks = () => {
    if (role === 'ADMIN') {
      return [
        { label: 'Admin Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'User Governance', path: '/admin', icon: <Users className="w-4 h-4" /> },
        { label: 'Job Search', path: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
        { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
      ];
    }
    if (role === 'STARTUP') {
      return [
        { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'My Jobs', path: '/startup/jobs', icon: <Briefcase className="w-4 h-4" /> },
        { label: 'Candidate Discovery', path: '/startup/candidates', icon: <Users className="w-4 h-4" /> },
        { label: 'Recruitment Pipeline', path: '/startup/ats', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'Invitations', path: '/startup/invitations', icon: <Send className="w-4 h-4" /> },
        { label: 'Interviews', path: '/startup/interviews', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Analytics', path: '/startup/analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Company Profile', path: '/startup/profile', icon: <Building2 className="w-4 h-4" /> },
      ];
    }
    return [
      { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Jobs', path: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Companies', path: '/companies', icon: <Building2 className="w-4 h-4" /> },
      { label: 'AI Matching', path: '/matching', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'Applications', path: '/applications', icon: <FileText className="w-4 h-4" /> },
      { label: 'Career Roadmap', path: '/career', icon: <Compass className="w-4 h-4" /> },
      { label: 'Assessments', path: '/assessments', icon: <Award className="w-4 h-4" /> },
      { label: 'Invitations', path: '/invitations', icon: <Send className="w-4 h-4" /> },
      { label: 'Interviews', path: '/interviews', icon: <Calendar className="w-4 h-4" /> },
    ];
  };

  return (
    <div className="flex min-h-screen bg-[#050816] text-slate-100 relative selection:bg-sky-500/30 selection:text-sky-200">
      {/* Persistent Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#07111F] border-r border-white/10 p-5 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-base bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                CareerPilot
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {getNavLinks().map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    )
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
};
