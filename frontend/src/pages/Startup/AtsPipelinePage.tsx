import React, { useState, useEffect } from 'react';
import { Layers, Briefcase, Filter } from 'lucide-react';
import { Application, ApplicationStatus, Job } from '../../types';
import { atsApi } from '../../api/atsApi';
import { jobApi } from '../../api/jobApi';
import { AtsBoard } from '../../components/ats/AtsBoard';
import { ScheduleInterviewModal } from '../../components/interviews/ScheduleInterviewModal';
import { LoadingScreen } from '../../components/ui/LoadingScreen';

const DEFAULT_EMPTY_PIPELINE: Record<ApplicationStatus, Application[]> = {
  APPLIED: [],
  SHORTLISTED: [],
  INTERVIEW: [],
  SELECTED: [],
  REJECTED: [],
};

export const AtsPipelinePage: React.FC = () => {
  const [pipeline, setPipeline] = useState<Record<ApplicationStatus, Application[]> | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedScheduleApp, setSelectedScheduleApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pipeRes, jobsRes] = await Promise.all([
        atsApi.getPipeline(selectedJobId || undefined),
        jobApi.getMyJobs(),
      ]);

      if (pipeRes.success && pipeRes.data) {
        setPipeline(pipeRes.data.pipeline);
      } else {
        setPipeline(DEFAULT_EMPTY_PIPELINE);
      }
      if (jobsRes.success && jobsRes.data) {
        setJobs(jobsRes.data);
      }
    } catch (err) {
      console.warn('ATS Pipeline fetch error:', err);
      setPipeline(DEFAULT_EMPTY_PIPELINE);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedJobId]);

  if (isLoading) {
    return <LoadingScreen message="Loading ATS recruitment pipeline board..." />;
  }

  const activePipeline = pipeline || DEFAULT_EMPTY_PIPELINE;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-bold text-cyan-300 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Recruitment Kanban</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            ATS Recruitment Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Drag and drop candidate cards across hiring stages to automatically notify candidates and update pipeline metrics.
          </p>
        </div>

        {/* Filter by Job */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-semibold text-slate-400 hidden sm:inline">Filter Job:</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="glass-input rounded-xl px-4 py-2 text-xs font-semibold text-slate-100 cursor-pointer min-w-[200px]"
          >
            <option value="" className="bg-slate-900 text-slate-200">
              All Company Jobs ({jobs.length})
            </option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id} className="bg-slate-900 text-slate-200">
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Component */}
      <AtsBoard
        initialPipeline={activePipeline}
        onScheduleInterview={(app) => setSelectedScheduleApp(app)}
      />

      {/* Schedule Interview Modal Trigger */}
      {selectedScheduleApp && (
        <ScheduleInterviewModal
          isOpen={true}
          application={selectedScheduleApp}
          onClose={() => setSelectedScheduleApp(null)}
          onSuccess={() => {
            setSelectedScheduleApp(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};
