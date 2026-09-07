import React, { useState, useEffect } from 'react';
import { FileText, Building2, MapPin, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Application } from '../../types';
import { applicationApi } from '../../api/applicationApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { MatchBadge } from '../../components/intelligence/MatchBadge';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await applicationApi.getMyApplications();
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.warn('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SHORTLISTED':
        return <Badge variant="primary" size="sm">Shortlisted</Badge>;
      case 'INTERVIEW':
        return <Badge variant="ai" size="sm">Interview Stage</Badge>;
      case 'SELECTED':
        return <Badge variant="success" size="sm">Selected / Offer</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">Not Selected</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Application Submitted</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Application Tracking & ATS Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor your recruitment progress across active startup hiring pipelines.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No Active Applications"
          description="You haven't applied to any job positions yet. Discover matching startup roles to apply."
          actionLabel="Explore Jobs"
          onAction={() => navigate('/jobs')}
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <GlassCard
              key={app._id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/10 hover:border-slate-700 transition-all cursor-pointer"
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">{app.job?.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-sky-400 font-semibold">{app.company?.companyName}</span>
                    <span>•</span>
                    <span>Applied {new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {app.matchScore !== undefined && (
                  <MatchBadge score={app.matchScore} size="sm" />
                )}
                {getStatusBadge(app.status)}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Status History Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={selectedApp.job?.title}
          description={`Application to ${selectedApp.company?.companyName}`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stage</span>
                <span className="text-sm font-extrabold text-slate-100">{selectedApp.status}</span>
              </div>
              <MatchBadge score={selectedApp.matchScore || 80} size="md" />
            </div>

            {/* Status History Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Recruitment Stage Progression
              </h4>
              <div className="space-y-3 pl-4 border-l border-slate-800">
                {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                  selectedApp.statusHistory.map((hist, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400" />
                      <p className="text-xs font-bold text-slate-200">{hist.status}</p>
                      {hist.note && <p className="text-[11px] text-slate-400 mt-0.5">{hist.note}</p>}
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {new Date(hist.changedAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Applied on {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {selectedApp.resumeUrl && (
              <div className="pt-2 border-t border-slate-800">
                <a
                  href={selectedApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" /> View Attached Resume PDF
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
