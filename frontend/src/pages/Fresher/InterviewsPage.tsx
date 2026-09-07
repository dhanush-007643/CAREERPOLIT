import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Building2, ExternalLink } from 'lucide-react';
import { Interview } from '../../types';
import { interviewApi } from '../../api/interviewApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export const InterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await interviewApi.getAll();
      if (res.success && res.data) {
        setInterviews(res.data);
      }
    } catch (err) {
      console.warn('Interviews fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Scheduled Interviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Join your upcoming virtual interview rounds and review preparation agendas.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No Scheduled Interviews"
          description="When startups schedule an interview round with you, it will appear here with meeting links."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => (
            <GlassCard key={item._id} className="p-5 space-y-4 border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="ai" size="sm">
                    {item.interviewType}
                  </Badge>
                  <Badge
                    variant={item.status === 'SCHEDULED' ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-100">
                  {typeof item.company === 'object' ? item.company?.companyName : 'Startup Interview'}
                </h3>

                <div className="space-y-1 text-xs text-slate-300 my-3">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>{new Date(item.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.time} ({item.durationMinutes || 45} mins)</span>
                  </p>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={item.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    leftIcon={<Video className="w-4 h-4" />}
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Join Video Meeting
                  </Button>
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
