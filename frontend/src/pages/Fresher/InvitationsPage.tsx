import React, { useState, useEffect } from 'react';
import { Send, Building2, Check, X, Clock, Briefcase } from 'lucide-react';
import { Invitation } from '../../types';
import { invitationApi } from '../../api/invitationApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export const InvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const res = await invitationApi.getAll();
      if (res.success && res.data) {
        setInvitations(res.data);
      }
    } catch (err) {
      console.warn('Invitations fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await invitationApi.accept(id);
      success('Invitation Accepted', 'The startup has been notified of your acceptance.');
      fetchInvitations();
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.message || 'Could not accept invitation.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await invitationApi.reject(id);
      success('Invitation Declined', 'The invitation was declined.');
      fetchInvitations();
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.message || 'Could not decline invitation.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Direct Startup Invitations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review invitations sent directly to you by hiring managers and tech founders.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={<Send className="w-6 h-6" />}
          title="No Invitations Yet"
          description="Startups that review your verified profile will send direct invitations here."
        />
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => (
            <GlassCard key={inv._id} className="p-5 space-y-4 border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100">
                      {inv.company?.companyName} invited you for <span className="text-sky-400">{inv.job?.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sent {new Date(inv.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    inv.status === 'ACCEPTED'
                      ? 'success'
                      : inv.status === 'REJECTED'
                      ? 'error'
                      : 'ai'
                  }
                  size="sm"
                >
                  {inv.status}
                </Badge>
              </div>

              {inv.message && (
                <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  "{inv.message}"
                </p>
              )}

              {inv.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<X className="w-3.5 h-3.5" />}
                    onClick={() => handleReject(inv._id)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => handleAccept(inv._id)}
                  >
                    Accept Invitation
                  </Button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
