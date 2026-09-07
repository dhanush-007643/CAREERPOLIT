import React from 'react';
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Send,
  Lock,
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Job, MatchAnalysis } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MatchBadge } from '../intelligence/MatchBadge';

interface JobDetailViewProps {
  job: Job;
  matchAnalysis?: MatchAnalysis | null;
  hasApplied?: boolean;
  onApply: () => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  matchAnalysis,
  hasApplied,
  onApply,
}) => {
  const company = typeof job.company === 'object' ? job.company : null;

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6">
      {/* Job Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> {company?.companyName || 'Startup'}
            </span>
            <span>•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{job.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="primary" size="sm">{job.workMode}</Badge>
            <Badge variant="secondary" size="sm">{job.employmentType.replace('_', ' ')}</Badge>
            {job.visibility === 'PRIVATE' ? (
              <Badge variant="warning" size="sm" icon={<Lock className="w-3 h-3" />}>
                Private Opportunity
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" icon={<Globe className="w-3 h-3" />}>
                Public Job
              </Badge>
            )}
          </div>
        </div>

        {/* Apply CTA */}
        <div className="shrink-0 flex flex-col sm:items-end gap-2">
          {hasApplied ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Applied
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={onApply}
            >
              Apply Now
            </Button>
          )}
          {job.salaryRange && job.salaryRange.max ? (
            <span className="text-xs font-mono text-emerald-400 font-bold">
              ${job.salaryRange.min?.toLocaleString()} - ${job.salaryRange.max?.toLocaleString()} / year
            </span>
          ) : null}
        </div>
      </div>

      {/* AI Match Intelligence Box */}
      {matchAnalysis && (
        <div className="glass-card-ai p-4 rounded-xl border border-violet-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-violet-300">
                ✦ CareerPilot Match Analysis
              </span>
            </div>
            <MatchBadge score={matchAnalysis.matchScore} size="md" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-lg border border-violet-500/15">
            "{matchAnalysis.explanation}"
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Matched Skills</span>
              <div className="flex flex-wrap gap-1">
                {matchAnalysis.matchedSkills?.map((s) => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[11px]">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Skill Gap</span>
              <div className="flex flex-wrap gap-1">
                {matchAnalysis.missingSkills?.map((s) => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[11px]">
                    ⚠ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About the Role</h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">{job.description}</p>
      </div>

      {/* Required & Preferred Skills */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Required Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {job.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {job.preferredSkills && job.preferredSkills.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Preferred Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {job.preferredSkills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Responsibilities</h4>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
            {job.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Company Info Box */}
      {company && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200">About {company.companyName}</h4>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:underline flex items-center gap-1"
              >
                Visit Website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{company.aboutCompany || company.description}</p>
        </div>
      )}
    </div>
  );
};
