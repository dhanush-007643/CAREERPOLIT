import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { atsApi } from '../../api/atsApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { LoadingScreen } from '../../components/ui/LoadingScreen';

export const StartupAnalyticsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [matchDistribution, setMatchDistribution] = useState<any[]>([]);
  const [totalApplicants, setTotalApplicants] = useState<number>(0);
  const [meanMatchScore, setMeanMatchScore] = useState<number>(0);
  const [interviewConversion, setInterviewConversion] = useState<number>(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await atsApi.getPipeline();
        if (res.success && res.data?.pipeline) {
          const p = res.data.pipeline;
          const applied = (p.APPLIED || []).length;
          const shortlisted = (p.SHORTLISTED || []).length;
          const interview = (p.INTERVIEW || []).length;
          const selected = (p.SELECTED || []).length;
          const rejected = (p.REJECTED || []).length;

          const allApps = [
            ...(p.APPLIED || []),
            ...(p.SHORTLISTED || []),
            ...(p.INTERVIEW || []),
            ...(p.SELECTED || []),
            ...(p.REJECTED || []),
          ];

          const total = allApps.length;
          setTotalApplicants(total);

          const funnel = [
            { stage: 'Applied', candidates: total, fill: '#38BDF8' },
            { stage: 'Shortlisted', candidates: shortlisted + interview + selected, fill: '#22D3EE' },
            { stage: 'Interview', candidates: interview + selected, fill: '#8B5CF6' },
            { stage: 'Selected', candidates: selected, fill: '#22C55E' },
            { stage: 'Rejected', candidates: rejected, fill: '#F43F5E' },
          ];
          setFunnelData(funnel);

          // Mean match score
          if (allApps.length > 0) {
            const sumScore = allApps.reduce((acc, a) => acc + (a.matchScore || 0), 0);
            setMeanMatchScore(Math.round(sumScore / allApps.length));
          } else {
            setMeanMatchScore(0);
          }

          // Interview conversion
          const interviewPlus = interview + selected;
          setInterviewConversion(interviewPlus > 0 && total > 0 ? Math.round((selected / interviewPlus) * 100) : 0);

          // Bucketing
          const buckets: Record<string, number> = { '90-100%': 0, '80-89%': 0, '70-79%': 0, '60-69%': 0, '<60%': 0 };
          allApps.forEach((a) => {
            const sc = a.matchScore || 0;
            if (sc >= 90) buckets['90-100%']++;
            else if (sc >= 80) buckets['80-89%']++;
            else if (sc >= 70) buckets['70-79%']++;
            else if (sc >= 60) buckets['60-69%']++;
            else buckets['<60%']++;
          });

          setMatchDistribution(
            Object.entries(buckets).map(([range, count]) => ({ range, count }))
          );
        }
      } catch (err) {
        console.warn('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Aggregating recruitment funnel analytics..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Recruitment Intelligence & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Hiring funnel velocity, candidate match distribution, and sourcing performance.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400">Total Applicants Ingested</span>
          <p className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{totalApplicants}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">✓ Verified candidate applications</span>
        </GlassCard>

        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400">Mean Candidate Match Score</span>
          <p className="text-2xl font-extrabold font-mono text-violet-300 mt-1">{meanMatchScore}%</p>
          <span className="text-[10px] text-violet-400 font-semibold">✦ AI multi-attribute evaluation</span>
        </GlassCard>

        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400">Interview Selection Rate</span>
          <p className="text-2xl font-extrabold font-mono text-cyan-300 mt-1">{interviewConversion}%</p>
          <span className="text-[10px] text-cyan-400 font-semibold">↑ Offer / Interview completion ratio</span>
        </GlassCard>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATS Recruitment Funnel */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              ATS Recruitment Pipeline Funnel
            </h3>
            <span className="text-xs text-slate-400">Total Applicants: {totalApplicants}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="candidates" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Match Score Distribution */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Candidate Match Score Distribution
            </h3>
            <span className="text-xs text-violet-400 font-semibold">✦ Real Distribution</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={matchDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#scoreGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
