import React from 'react';
import { Building2, MapPin, Globe, Lock, DollarSign } from 'lucide-react';
import { Job } from '../../types';
import { MatchBadge } from '../intelligence/MatchBadge';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  matchScore?: number;
  onClick?: () => void;
  onApply?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSelected,
  matchScore,
  onClick,
}) => {
  const companyName =
    typeof job.company === 'object' && job.company?.companyName
      ? job.company.companyName
      : 'Startup Enterprise';

  const isPrivate = job.visibility === 'PRIVATE';
  const employmentTypeDisplay = (job.employmentType || 'FULL_TIME').replace('_', ' ');
  const skillsList = job.requiredSkills || [];

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover transition-all cursor-pointer border',
        isSelected
          ? 'border-sky-400/80 bg-slate-900/90 shadow-lg shadow-sky-500/15 ring-1 ring-sky-400/30'
          : 'border-white/10 hover:border-slate-600'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="text-sky-400 font-semibold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> {companyName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" /> {job.location || 'Remote'}
            </span>
          </div>
        </div>

        {/* Match score / Private badge */}
        {matchScore !== undefined ? (
          <MatchBadge score={matchScore} size="sm" />
        ) : isPrivate ? (
          <Badge variant="warning" size="sm" icon={<Lock className="w-3 h-3" />}>
            Private
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm" icon={<Globe className="w-3 h-3" />}>
            Public
          </Badge>
        )}
      </div>

      {/* Meta Pills */}
      <div className="flex flex-wrap items-center gap-2 my-3">
        <Badge variant="primary" size="sm">
          {job.workMode || 'REMOTE'}
        </Badge>
        <Badge variant="secondary" size="sm">
          {employmentTypeDisplay}
        </Badge>
        {job.salaryRange && job.salaryRange.max ? (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-0.5 font-semibold">
            <DollarSign className="w-3 h-3" />
            {job.salaryRange.min ? `${(job.salaryRange.min / 1000).toFixed(0)}k - ` : ''}
            {(job.salaryRange.max / 1000).toFixed(0)}k / yr
          </span>
        ) : null}
      </div>

      {/* Skills tags */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
        {skillsList.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-white/5"
          >
            {skill}
          </span>
        ))}
        {skillsList.length > 4 && (
          <span className="text-[10px] text-slate-500 px-1 py-0.5">
            +{skillsList.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
};
