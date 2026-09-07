import React, { useState, useEffect } from 'react';
import { Send, User, Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { invitationApi } from '../../api/invitationApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const StartupInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const res = await invitationApi.getAll();
      if (res.success && res.data) {
        setInvitations(res.data);
      }
    } catch (err) {
      console.warn('Startup invitations fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>Accepted</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm" icon={<XCircle className="w-3 h-3" />}>Declined</Badge>;
      case 'EXPIRED':
        return <Badge variant="neutral" size="sm">Expired</Badge>;
      default:
        return <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />}>Pending Response</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Sent Candidate Invitations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track recruitment invitations sent to top-matched fresher candidates.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Send className="w-4 h-4" />}
          onClick={() => navigate('/startup/candidates')}
        >
          Discover & Invite Candidates
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : invitations.length > 0 ? (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const candidateName = inv.fresher?.name || 'Fresher Candidate';
            const candidateEmail = inv.fresher?.email || '';
            const jobTitle = inv.job?.title || 'Open Position';

            return (
              <GlassCard key={inv._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-bold text-sm text-sky-400 shrink-0 shadow-md">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-100">{candidateName}</h3>
                      {getStatusBadge(inv.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <Briefcase className="w-3.5 h-3.5 text-sky-400" /> {jobTitle}
                      </span>
                      {candidateEmail && <span>• {candidateEmail}</span>}
                      {inv.expiryDate && (
                        <span>• Expires: {new Date(inv.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    {inv.message && (
                      <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 italic">
                        "{inv.message}"
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Candidate Invitations Sent Yet"
          description="Browse matched candidate profiles and invite them directly to apply for your openings."
          actionLabel="Find Candidates"
          onAction={() => navigate('/startup/candidates')}
        />
      )}
    </div>
  );
};
