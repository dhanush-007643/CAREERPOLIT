import React, { useState } from 'react';
import { Send, User, Briefcase, MessageSquare } from 'lucide-react';
import { Job, User as UserType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { invitationApi } from '../../api/invitationApi';
import { useToast } from '../../context/ToastContext';

interface InviteCandidateModalProps {
  candidate: { id: string; name: string } | null;
  jobs: Job[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteCandidateModal: React.FC<InviteCandidateModalProps> = ({
  candidate,
  jobs,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?._id || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  if (!candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      toastError('Selection Required', 'Please select a job to invite this candidate for.');
      return;
    }

    setIsSubmitting(true);
    try {
      await invitationApi.create({
        fresherId: candidate.id,
        jobId: selectedJobId,
        message: message || `We were impressed with your profile and would love to interview you for this position.`,
      });
      success('Invitation Dispatched', `Direct invitation sent to ${candidate.name}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Invitation Failed', err.response?.data?.message || 'Could not send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Candidate"
      description={`Send a direct interview invitation to ${candidate.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Candidate preview */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">{candidate.name}</p>
            <p className="text-[10px] text-slate-400">Target Candidate</p>
          </div>
        </div>

        {/* Job selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Target Job Opening
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-slate-100 cursor-pointer"
          >
            {jobs.map((j) => (
              <option key={j._id} value={j._id} className="bg-slate-900">
                {j.title} ({j.workMode})
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Personal Note
          </label>
          <textarea
            rows={3}
            placeholder="Why is this candidate a great match for your engineering team?..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
