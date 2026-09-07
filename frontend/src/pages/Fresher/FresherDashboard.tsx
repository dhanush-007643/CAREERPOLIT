import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { IntelligencePanel } from '../../components/intelligence/IntelligencePanel';
import { JobCard } from '../../components/jobs/JobCard';
import { ApplyJobModal } from '../../components/jobs/ApplyJobModal';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { matchingApi } from '../../api/matchingApi';
import { profileApi } from '../../api/profileApi';
import { applicationApi } from '../../api/applicationApi';
import { interviewApi } from '../../api/interviewApi';
import { MatchAnalysis, FresherProfile, Application, Job } from '../../types';

export const FresherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<FresherProfile | null>(null);
  const [matches, setMatches] = useState<MatchAnalysis[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplyJob, setSelectedApplyJob] = useState<Job | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, matchRes, appsRes, interviewsRes] = await Promise.allSettled([
        profileApi.getProfile(),
        matchingApi.getMatchedJobs(6),
        applicationApi.getMyApplications({ limit: 5 }),
        interviewApi.getAll(1, 10),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setProfile(profileRes.value.data);
      }
      if (matchRes.status === 'fulfilled' && matchRes.value.success) {
        setMatches(matchRes.value.data || []);
      }
      if (appsRes.status === 'fulfilled' && appsRes.value.success) {
        setApplications(appsRes.value.data || []);
      }
      if (interviewsRes.status === 'fulfilled' && interviewsRes.value.success) {
        setInterviewsCount(interviewsRes.value.data?.length || 0);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Aggregating your CareerPilot intelligence overview..." />;
  }

  const topMatch = matches[0] || null;
  const strongMatchesCount = matches.filter((m) => m.matchScore >= 75).length;
  const completionPercentage = profile?.completionPercentage || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dynamic Contextual Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[11px] font-bold text-sky-400 mb-2">
          <span>✦ Live Intelligence Active</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">{user?.name}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Here is your career intelligence overview and recommended startup opportunities.
        </p>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completion */}
        <GlassCard className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Profile Status</span>
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">{completionPercentage}%</span>
              <span className="text-xs text-emerald-400 font-semibold">Complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Strong AI Matches */}
        <GlassCard className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Strong Matches</span>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
                {strongMatchesCount.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-violet-400 font-semibold">Jobs (≥75%)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Based on verified skill overlap</p>
          </div>
        </GlassCard>

        {/* Active Applications */}
        <GlassCard className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Applications</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
                {applications.length.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-cyan-400 font-semibold">Submitted</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Tracked in ATS pipelines</p>
          </div>
        </GlassCard>

        {/* Upcoming Interviews */}
        <GlassCard className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Interviews</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
                {interviewsCount.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Upcoming</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Virtual interview rounds</p>
          </div>
        </GlassCard>
      </div>

      {/* ✦ CareerPilot Intelligence Best Match Spotlight */}
      {topMatch && (
        <IntelligencePanel
          match={topMatch}
          onViewAnalysis={() => navigate('/matching')}
          onApply={() => topMatch.job && setSelectedApplyJob(topMatch.job)}
        />
      )}

      {/* Recommended Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Recommended Opportunities</h2>
            <p className="text-xs text-slate-400">High-overlap roles calculated by CareerPilot AI</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/jobs')}
          >
            Explore All Jobs
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.slice(0, 6).map((m) =>
            m.job ? (
              <JobCard
                key={m.job._id}
                job={m.job}
                matchScore={m.matchScore}
                onClick={() => navigate(`/jobs`)}
              />
            ) : null
          )}
        </div>
      </div>

      {/* Recent Applications Snapshot */}
      {applications.length > 0 && (
        <GlassCard className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100">Recent Applications & ATS Status</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/applications')}
              className="text-xs text-sky-400"
            >
              View All Applications →
            </Button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {applications.slice(0, 3).map((app) => (
              <div key={app._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100">{app.job?.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {app.company?.companyName} · Applied on{' '}
                    {new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    app.status === 'SHORTLISTED'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : app.status === 'SELECTED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : app.status === 'INTERVIEW'
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                      : 'bg-slate-800 text-slate-300 border-white/5'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Apply Modal */}
      <ApplyJobModal
        job={selectedApplyJob}
        profile={profile}
        isOpen={!!selectedApplyJob}
        onClose={() => setSelectedApplyJob(null)}
        onSuccess={fetchData}
      />
    </div>
  );
};
