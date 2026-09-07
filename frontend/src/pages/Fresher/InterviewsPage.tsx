import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Building2, ExternalLink, RefreshCw, Briefcase, MapPin } from 'lucide-react';
import { Interview } from '../../types';
import { interviewApi } from '../../api/interviewApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export const InterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Scheduled Interviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Join your upcoming virtual interview rounds and review preparation agendas.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInterviews}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="self-start sm:self-auto"
        >
          Refresh Schedule
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No Scheduled Interviews"
          description="When startups schedule an interview round with you, it will appear here with calendar dates and video meeting links."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => {
            const jobTitle = item.application?.job?.title || 'Engineering Position';
            const companyName = typeof item.company === 'object' ? item.company?.companyName : 'Tech Startup';
            const location = item.application?.job?.location || (typeof item.company === 'object' ? item.company?.location : null);
            const workMode = item.application?.job?.workMode;

            return (
              <GlassCard key={item._id} className="p-5 space-y-4 border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="ai" size="sm">
                      {item.interviewType || 'TECHNICAL'} ROUND
                    </Badge>
                    <Badge
                      variant={
                        item.status === 'SCHEDULED'
                          ? 'success'
                          : item.status === 'COMPLETED'
                          ? 'neutral'
                          : item.status === 'CANCELLED'
                          ? 'error'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 flex items-center justify-center font-bold text-sm shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{jobTitle}</h3>
                      <p className="text-xs text-sky-400 font-semibold">{companyName}</p>
                      {(location || workMode) && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {workMode && <span>{workMode}</span>}
                          {location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-500" /> {location}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-xs text-slate-300 my-3">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="font-semibold text-slate-200">
                        {new Date(item.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{item.time} ({item.durationMinutes || 45} mins)</span>
                    </p>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  {item.meetingLink ? (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        leftIcon={<Video className="w-4 h-4" />}
                        rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Join Virtual Meeting
                      </Button>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">No meeting link provided</span>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
