import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Sparkles, Compass, User, Users, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const MobileNav: React.FC = () => {
  const { role } = useAuth();

  const links =
    role === 'ADMIN'
      ? [
          { label: 'Admin', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
          { label: 'Jobs', path: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
          { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
        ]
      : role === 'STARTUP'
      ? [
          { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: 'Jobs', path: '/startup/jobs', icon: <Briefcase className="w-5 h-5" /> },
          { label: 'Pipeline', path: '/startup/ats', icon: <Sparkles className="w-5 h-5 text-cyan-400" /> },
          { label: 'Invites', path: '/startup/invitations', icon: <Compass className="w-5 h-5" /> },
          { label: 'Profile', path: '/startup/profile', icon: <User className="w-5 h-5" /> },
        ]
      : [
          { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: 'Jobs', path: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
          { label: 'AI Match', path: '/matching', icon: <Sparkles className="w-5 h-5 text-violet-400" /> },
          { label: 'Career', path: '/career', icon: <Compass className="w-5 h-5" /> },
          { label: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
        ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#07111F]/90 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-2">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors',
              isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            )
          }
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
