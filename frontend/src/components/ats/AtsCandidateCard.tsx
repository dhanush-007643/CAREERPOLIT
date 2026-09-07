import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, Mail, FileText } from 'lucide-react';
import { Application } from '../../types';
import { MatchBadge } from '../intelligence/MatchBadge';

interface AtsCandidateCardProps {
  application: Application;
  onScheduleInterview?: (app: Application) => void;
  onViewCandidate?: (app: Application) => void;
}

export const AtsCandidateCard: React.FC<AtsCandidateCardProps> = ({
  application,
  onScheduleInterview,
  onViewCandidate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application._id,
    data: {
      type: 'Application',
      application,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const fresherName = application.fresher?.name || 'Applicant';
  const jobTitle = application.job?.title || 'Open Position';
  const matchScore = application.matchScore ?? 80;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3.5 rounded-xl border glass-panel transition-all select-none ${
        isDragging
          ? 'opacity-60 scale-105 border-sky-400 shadow-2xl shadow-sky-500/20 z-50'
          : 'hover:border-slate-600 hover:bg-slate-850'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {fresherName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4
              onClick={() => onViewCandidate && onViewCandidate(application)}
              className="text-xs font-bold text-slate-100 truncate hover:text-sky-300 cursor-pointer"
            >
              {fresherName}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">{jobTitle}</p>
          </div>
        </div>

        {/* Drag handle */}
        <div {...attributes} {...listeners} className="text-slate-500 hover:text-slate-300 p-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Match Score & Status */}
      <div className="flex items-center justify-between gap-2 my-2.5">
        <MatchBadge score={matchScore} size="sm" />
        <span className="text-[10px] text-slate-400">
          {new Date(application.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
        {application.resumeUrl ? (
          <a
            href={application.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-sky-300 flex items-center gap-1"
          >
            <FileText className="w-3 h-3" /> Resume
          </a>
        ) : (
          <span />
        )}

        {application.status === 'INTERVIEW' && onScheduleInterview && (
          <button
            onClick={() => onScheduleInterview(application)}
            className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3 h-3" /> Schedule
          </button>
        )}
      </div>
    </div>
  );
};
