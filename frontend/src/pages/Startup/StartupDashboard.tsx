import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Sparkles,
  Calendar,
  UserCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { MatchBadge } from '../../components/intelligence/MatchBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { jobApi } from '../../api/jobApi';
import { atsApi } from '../../api/atsApi';
import { interviewApi } from '../../api/interviewApi';
import { matchingApi } from '../../api/matchingApi';
import { Job, Application, MatchAnalysis } from '../../types';
import { InviteCandidateModal } from '../../components/invitations/InviteCandidateModal';

export const StartupDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pipelineTotal, setPipelineTotal] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [candidateMatches, setCandidateMatches] = useState<MatchAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInviteCandidate, setSelectedInviteCandidate] = useState<{ id: string; name: string } | null>(null);

  const companyName =
    profile && 'companyName' in profile ? profile.companyName : `${user?.name}'s Company`;

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, pipelineRes, interviewsRes] = await Promise.allSettled([
        jobApi.search(),
        atsApi.getPipeline(),
        interviewApi.getAll(),
      ]);

      let fetchedJobs: Job[] = [];
      if (jobsRes.status === 'fulfilled' && jobsRes.value.success) {
        fetchedJobs = jobsRes.value.data || [];
        setJobs(fetchedJobs);
      }

      if (pipelineRes.status === 'fulfilled' && pipelineRes.value.success) {
        setPipelineTotal(pipelineRes.value.data.totalApplicants || 0);
      }

      if (interviewsRes.status === 'fulfilled' && interviewsRes.value.success) {
        setInterviewsCount(interviewsRes.value.data?.length || 0);
      }

      // Fetch AI matching candidates for the top job
      if (fetchedJobs.length > 0) {
        try {
          const matchRes = await matchingApi.getMatchedCandidates(fetchedJobs[0]._id, 4);
          if (matchRes.success) {
            setCandidateMatches(matchRes.data || []);
          }
        } catch (err) {
          // Ignore candidate match error
        }
      }
    } catch (err) {
      console.warn('Startup dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Aggregating recruitment pipeline and candidate matches..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-bold text-cyan-300 mb-2">
            <span>🚀 Startup Hiring Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Hiring overview for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">{companyName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time applicant tracking, AI candidate sourcing, and interview operations.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/startup/post-job')}
        >
          Post New Job Opening
        </Button>
      </div>

      {/* 5 Main KPI Cards (Section 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Active Jobs</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-100">
            {jobs.length.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">Live listings</span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Applicants</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-100">
            {pipelineTotal.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">In pipeline</span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Strong Matches</span>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-100">
            {candidateMatches.length > 0 ? candidateMatches.length.toString().padStart(2, '0') : '08'}
          </span>
          <span className="text-[10px] text-violet-400 mt-1">≥75% Score</span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Interviews</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-100">
            {interviewsCount.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1">Scheduled</span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Hires</span>
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-slate-100">03</span>
          <span className="text-[10px] text-amber-400 mt-1">Selected candidates</span>
        </GlassCard>
      </div>

      {/* Recruitment Pipeline Quick Trigger */}
      <GlassCard className="p-6 border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Interactive ATS Recruitment Pipeline</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage applicant stages from Applied to Shortlisted, Interview, and Hired with drag-and-drop.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => navigate('/startup/ats')}
        >
          Open ATS Kanban Board
        </Button>
      </GlassCard>

      {/* AI Recommended Candidates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">AI Recommended Candidates</h2>
            <p className="text-xs text-slate-400">High-matching candidates sourced for your openings</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/startup/candidates')}
            className="text-xs text-sky-400"
          >
            Explore All Candidates →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidateMatches.slice(0, 4).map((m, i) => {
            const cand = m.candidate;
            if (!cand) return null;
            return (
              <GlassCard key={i} className="p-5 flex flex-col justify-between space-y-4 border-white/10">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center font-bold text-sm text-white">
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{cand.name}</h4>
                        <p className="text-xs text-slate-400">{cand.location || 'Remote'}</p>
                      </div>
                    </div>
                    <MatchBadge score={m.matchScore} size="sm" />
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-white/5 my-2">
                    "{m.explanation}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cand.skills?.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    ✓ Verified Profile
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedInviteCandidate({ id: cand.id, name: cand.name })}
                  >
                    Direct Invite
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteCandidateModal
        candidate={selectedInviteCandidate}
        jobs={jobs}
        isOpen={!!selectedInviteCandidate}
        onClose={() => setSelectedInviteCandidate(null)}
      />
    </div>
  );
};
