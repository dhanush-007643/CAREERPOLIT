import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { MatchAnalysis } from '../../types';

interface IntelligencePanelProps {
  match?: MatchAnalysis | null;
  onViewAnalysis?: () => void;
  onApply?: () => void;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  match,
  onViewAnalysis,
  onApply,
}) => {
  if (!match) return null;

  const job = match.job;
  const companyName =
    typeof job?.company === 'object' && job?.company?.companyName
      ? job.company.companyName
      : 'Featured Startup';

  return (
    <GlassCard variant="ai" className="relative overflow-hidden p-6 sm:p-7 border-violet-500/30">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
                ✦ CareerPilot Intelligence
              </span>
              <p className="text-[11px] text-slate-400">AI-curated top match for your profile</p>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-violet-600/30 border border-violet-400/50 text-violet-200 text-sm font-extrabold font-mono shadow-glow-ai">
            {match.matchScore}% MATCH
          </div>
        </div>

        {/* Job Title & Company */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-100">{job?.title || 'Senior React & Node Engineer'}</h3>
          <p className="text-sm text-sky-400 font-medium">{companyName} · {job?.location || 'Remote'}</p>
        </div>

        {/* Matched & Missing Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-slate-950/40 border border-white/5 mb-5">
          {/* Matched Skills */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Matched Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {match.matchedSkills && match.matchedSkills.length > 0 ? (
                match.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Evaluating profile...</span>
              )}
            </div>
          </div>

          {/* Skill Gap */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Skill Gap
            </span>
            <div className="flex flex-wrap gap-1.5">
              {match.missingSkills && match.missingSkills.length > 0 ? (
                match.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" /> {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No skill gaps identified!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Explanation */}
        {match.explanation && (
          <p className="text-xs text-slate-300 italic mb-5 leading-relaxed bg-violet-950/20 p-3 rounded-lg border border-violet-500/20">
            "{match.explanation}"
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onViewAnalysis && (
            <Button variant="secondary" size="sm" onClick={onViewAnalysis}>
              View Full Analysis
            </Button>
          )}
          {onApply && (
            <Button variant="ai" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={onApply}>
              Instant Apply Now
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
