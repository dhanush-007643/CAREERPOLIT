import React, { useState } from 'react';
import { Send, FileText, Upload } from 'lucide-react';
import { Job, FresherProfile } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { jobApi } from '../../api/jobApi';
import { useToast } from '../../context/ToastContext';

interface ApplyJobModalProps {
  job: Job | null;
  profile: FresherProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  profile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  if (!job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.resumeUrl) {
      toastError('Resume Required', 'Please upload a resume in your profile before applying.');
      return;
    }

    setIsSubmitting(true);
    try {
      await jobApi.apply(job._id, {
        coverLetter,
        resumeUrl: profile.resumeUrl,
      });
      success('Application Submitted!', `Your profile was successfully submitted for ${job.title}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not submit application.';
      toastError('Submission Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for ${job.title}`}
      description={`Submit your verified credentials to ${
        typeof job.company === 'object' ? job.company?.companyName : 'the company'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resume Preview */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">
                {profile?.fullName ? `${profile.fullName}_Resume.pdf` : 'Candidate_Resume.pdf'}
              </p>
              <p className="text-[11px] text-slate-400">
                {profile?.resumeUrl ? 'Verified profile resume attached' : 'No resume uploaded yet'}
              </p>
            </div>
          </div>
          {profile?.resumeUrl ? (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
              Attached
            </span>
          ) : (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              Upload Needed
            </span>
          )}
        </div>

        {/* Cover Letter Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Cover Note (Optional)
          </label>
          <textarea
            rows={4}
            placeholder="Introduce yourself and highlight why your skill set matches this position..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 resize-none"
          />
        </div>

        {/* Modal Actions */}
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
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
