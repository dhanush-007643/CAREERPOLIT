import React, { useState, useEffect } from 'react';
import { Users, Search, Sparkles, Send, FileText, CheckCircle2, MapPin } from 'lucide-react';
import { Job, MatchAnalysis } from '../../types';
import { jobApi } from '../../api/jobApi';
import { matchingApi } from '../../api/matchingApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { MatchBadge } from '../../components/intelligence/MatchBadge';
import { InviteCandidateModal } from '../../components/invitations/InviteCandidateModal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const CandidateDiscoveryPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [candidateMatches, setCandidateMatches] = useState<MatchAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<{ id: string; name: string } | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await jobApi.getMyJobs();
      if (res.success && res.data && res.data.length > 0) {
        setJobs(res.data);
        setSelectedJobId(res.data[0]._id);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.warn('Jobs fetch error:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchCandidates = async (jobId: string) => {
    if (!jobId) return;
    setIsLoading(true);
    try {
      const res = await matchingApi.getMatchedCandidates(jobId, 12);
      if (res.success && res.data) {
        setCandidateMatches(res.data);
      }
    } catch (err) {
      console.warn('Candidate match fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidates(selectedJobId);
    }
  }, [selectedJobId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            AI Candidate Sourcing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover verified tech talent scored algorithmically against your job criteria.
          </p>
        </div>

        {/* Job opening selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 hidden sm:inline">Target Opening:</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="glass-input rounded-xl px-4 py-2 text-xs font-semibold text-slate-100 cursor-pointer min-w-[220px]"
          >
            {jobs.map((j) => (
              <option key={j._id} value={j._id} className="bg-slate-900">
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : candidateMatches.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No Candidates Found"
          description="Try creating a new job opening with varied skill criteria to expand match sourcing."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidateMatches.map((m, i) => {
            const cand = m.candidate;
            if (!cand) return null;

            return (
              <GlassCard key={i} className="p-5 flex flex-col justify-between space-y-4 border-white/10">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center font-bold text-sm text-white shrink-0">
                        {cand.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-100 truncate">{cand.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {cand.location || 'Remote'}
                        </p>
                      </div>
                    </div>
                    <MatchBadge score={m.matchScore} size="sm" />
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-white/5 my-3 leading-relaxed">
                    "{m.explanation}"
                  </p>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Matched Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {m.matchedSkills?.slice(0, 4).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[11px]">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  {cand.resumeUrl ? (
                    <a
                      href={cand.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" /> Resume
                    </a>
                  ) : (
                    <span />
                  )}

                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedCandidate({ id: cand.id, name: cand.name })}
                  >
                    Direct Invite
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Direct Invite Modal */}
      <InviteCandidateModal
        candidate={selectedCandidate}
        jobs={jobs}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};
