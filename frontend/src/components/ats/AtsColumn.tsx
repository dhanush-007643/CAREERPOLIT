import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Application, ApplicationStatus } from '../../types';
import { AtsCandidateCard } from './AtsCandidateCard';

interface AtsColumnProps {
  id: ApplicationStatus;
  title: string;
  count: number;
  color: string;
  applications: Application[];
  onScheduleInterview?: (app: Application) => void;
  onViewCandidate?: (app: Application) => void;
}

export const AtsColumn: React.FC<AtsColumnProps> = ({
  id,
  title,
  count,
  color,
  applications,
  onScheduleInterview,
  onViewCandidate,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] w-full max-w-xs rounded-2xl glass-panel p-3.5 border transition-all duration-200 ${
        isOver ? 'border-sky-400 bg-sky-950/20' : 'border-white/5'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h3>
        </div>
        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {count}
        </span>
      </div>

      {/* Droppable Card List */}
      <div className="flex-1 flex flex-col gap-2.5 min-h-[350px] overflow-y-auto">
        <SortableContext items={applications.map((a) => a._id)} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <AtsCandidateCard
              key={app._id}
              application={app}
              onScheduleInterview={onScheduleInterview}
              onViewCandidate={onViewCandidate}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4 border border-dashed border-slate-800 rounded-xl text-[11px] text-slate-500 text-center">
            Drop candidate here
          </div>
        )}
      </div>
    </div>
  );
};
