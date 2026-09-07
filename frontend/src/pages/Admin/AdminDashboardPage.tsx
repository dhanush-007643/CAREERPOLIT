import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getUsers(1, 20),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.success) {
        const payload = usersRes.value.data;
        const usersList = Array.isArray(payload) ? payload : (payload?.data || payload?.users || []);
        setUsers(usersList);
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const targetStatus = user.isActive === false;
    setUpdatingUserId(user._id);
    try {
      const res = await adminApi.toggleUserStatus(user._id, targetStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: targetStatus } : u))
        );
      }
    } catch (err) {
      console.warn('Failed to toggle user status:', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Aggregating platform health and admin telemetry..." />;
  }

  const totalUsers = stats?.totalUsers ?? stats?.metrics?.totalUsers ?? users.length;
  const totalCompanies = stats?.totalCompanies ?? stats?.metrics?.totalCompanies ?? 0;
  const totalJobs = stats?.totalJobs ?? stats?.metrics?.totalJobs ?? 0;
  const totalApplications = stats?.totalApplications ?? stats?.metrics?.totalApplications ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-[11px] font-bold text-violet-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>System Administration Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            CareerPilot Governance & Platform Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics, user governance, and database cluster telemetry.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAdminData}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Users</span>
          <span className="text-3xl font-extrabold font-mono text-slate-100 mt-2">
            {totalUsers}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1">✓ Active authentication records</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Registered Startups</span>
          <span className="text-3xl font-extrabold font-mono text-cyan-300 mt-2">
            {totalCompanies}
          </span>
          <span className="text-[10px] text-cyan-400 mt-1">Verified employer profiles</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Job Postings</span>
          <span className="text-3xl font-extrabold font-mono text-sky-300 mt-2">
            {totalJobs}
          </span>
          <span className="text-[10px] text-sky-400 mt-1">Active recruitment openings</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase">Applications</span>
          <span className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">
            {totalApplications}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1">Submitted candidate cases</span>
        </GlassCard>
      </div>

      {/* User Governance Table */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          Platform Registered Users Directory
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="pb-3 px-3">Name</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Registered Date</th>
                <th className="pb-3 px-3 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-200">{u.name}</td>
                    <td className="py-3 px-3 text-slate-400">{u.email}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={u.role === 'ADMIN' ? 'ai' : u.role === 'STARTUP' ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingUserId === u._id}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded transition-colors ${
                          u.isActive !== false
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        {u.isActive !== false ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No users loaded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
