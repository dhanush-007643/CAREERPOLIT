import React from 'react';
import { Settings, Shield, Bell, Moon, Key } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Account & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage session preferences, notification subscriptions, and password security.
        </p>
      </div>

      <GlassCard className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" /> Security & Authentication
        </h3>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div>
              <p className="text-xs font-bold text-slate-200">Email Address</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                user?.isEmailVerified
                  ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                  : 'text-amber-400 bg-amber-500/15 border-amber-500/30'
              }`}
            >
              {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <div>
              <p className="text-xs font-bold text-slate-200">Role Authority</p>
              <p className="text-[11px] text-slate-400">{user?.role} Tier Permission</p>
            </div>
            <span className="text-[11px] font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30">
              JWT Active
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-400" /> Notifications & Alerts
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-200">Instant AI Job Match Alerts</p>
              <p className="text-[11px] text-slate-400">Receive alerts when new jobs score ≥80% compatibility</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-sky-400" />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-200">ATS Status Updates</p>
              <p className="text-[11px] text-slate-400">Instant alerts when an application transitions stage</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-sky-400" />
          </label>
        </div>
      </GlassCard>
    </div>
  );
};
