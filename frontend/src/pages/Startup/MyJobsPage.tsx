import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, Globe, Lock, Users, Trash2, Edit3 } from 'lucide-react';
import { Job } from '../../types';
import { jobApi } from '../../api/jobApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';

export const MyJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await jobApi.getMyJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.warn('Jobs fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to close and delete "${title}"?`)) return;
    try {
      await jobApi.delete(id);
      success('Job Removed', `Job opening "${title}" was closed.`);
      fetchJobs();
    } catch (err) {
      toastError('Delete Failed', 'Could not delete job.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            My Job Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your startup's active recruitment requisitions and applicant pools.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/startup/post-job')}
        >
          Post New Position
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No Open Jobs"
          description="You haven't posted any positions yet. Create your first opening to attract top talent."
          actionLabel="Post a Job"
          onAction={() => navigate('/startup/post-job')}
        />
      ) : (
        <div className="space-y-3.5">
          {jobs.map((job) => (
            <GlassCard
              key={job._id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/10"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-100">{job.title}</h3>
                  {job.visibility === 'PRIVATE' ? (
                    <Badge variant="warning" size="sm" icon={<Lock className="w-3 h-3" />}>
                      Private
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" icon={<Globe className="w-3 h-3" />}>
                      Public
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <Badge variant="primary" size="sm">{job.workMode}</Badge>
                  <Badge variant="secondary" size="sm">{job.employmentType.replace('_', ' ')}</Badge>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>Posted {new Date(job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Users className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/startup/ats')}
                >
                  View Applicants
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(job._id, job.title)}
                  aria-label="Delete job"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
