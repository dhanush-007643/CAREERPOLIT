import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, Briefcase, ExternalLink, CheckCircle2 } from 'lucide-react';
import { interviewApi } from '../../api/interviewApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const StartupInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await interviewApi.getAll();
      if (res.success && res.data) {
        setInterviews(res.data);
      }
    } catch (err) {
      console.warn('Startup interviews fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await interviewApi.updateStatus(id, 'COMPLETED');
      success('Interview Completed', 'Interview status updated.');
      fetchInterviews();
    } catch (err: any) {
      toastError('Update Failed', 'Could not complete interview.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="error" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="primary" size="sm" icon={<Clock className="w-3 h-3" />}>Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Interview Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conduct, track, and complete candidate evaluation rounds.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          leftIcon={<Briefcase className="w-4 h-4" />}
          onClick={() => navigate('/startup/ats')}
        >
          View ATS Pipeline
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : interviews.length > 0 ? (
        <div className="space-y-4">
          {interviews.map((item) => {
            const candidateName = item.fresher?.name || 'Candidate';
            const candidateEmail = item.fresher?.email || '';
            const jobTitle = item.application?.job?.title || 'Open Role';
            const isCompleted = item.status === 'COMPLETED';

            return (
              <GlassCard key={item._id} className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-bold text-sm text-sky-400 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-100">{candidateName}</h3>
                      <p className="text-xs text-slate-400">{candidateEmail} • {jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <Badge variant="neutral" size="sm">{item.interviewType || 'TECHNICAL'}</Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.time} ({item.durationMinutes || 45} mins)
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                    <strong className="text-slate-300">Agenda / Notes:</strong> {item.notes}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  {item.meetingLink ? (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Open Video Room <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <div />}

                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(item._id)}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Scheduled Interviews"
          description="Schedule interviews directly with shortlisted candidates from your ATS Kanban pipeline."
          actionLabel="Go to ATS Board"
          onAction={() => navigate('/startup/ats')}
        />
      )}
    </div>
  );
};
