import React, { useState, useEffect, useRef } from 'react';
import { Send, FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Job, FresherProfile } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { jobApi } from '../../api/jobApi';
import { profileApi } from '../../api/profileApi';
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
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (profile?.resumeUrl) {
      setResumeUrl(profile.resumeUrl);
      setResumeFileName(profile.fullName ? `${profile.fullName}_Resume.pdf` : 'Candidate_Resume.pdf');
    }
  }, [profile, isOpen]);

  if (!job) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toastError('Invalid File', 'Please select a valid PDF or Word document (.pdf, .doc, .docx).');
      return;
    }

    setIsUploading(true);
    try {
      const res = await profileApi.uploadResume(file);
      if (res.success && res.data) {
        const uploadedUrl = res.data.profile?.resumeUrl || res.data.resume?.fileUrl;
        if (uploadedUrl) {
          setResumeUrl(uploadedUrl);
          setResumeFileName(file.name);
          success('Resume Uploaded', 'Your resume has been uploaded and linked to your profile.');
        }
      }
    } catch (err: any) {
      toastError('Upload Failed', err.response?.data?.message || 'Could not upload resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveResumeUrl = resumeUrl || profile?.resumeUrl;
    if (!effectiveResumeUrl) {
      toastError('Resume Required', 'Please upload a resume before submitting your application.');
      return;
    }

    setIsSubmitting(true);
    try {
      await jobApi.apply(job._id, {
        coverLetter,
        resumeUrl: effectiveResumeUrl,
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

  const hasResume = !!(resumeUrl || profile?.resumeUrl);

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
        {/* Resume Preview & Upload Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">
                {resumeFileName || (profile?.fullName ? `${profile.fullName}_Resume.pdf` : 'Candidate_Resume.pdf')}
              </p>
              <p className="text-[11px] text-slate-400">
                {hasResume ? 'Verified profile resume attached' : 'No resume uploaded yet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isUploading}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
            >
              {hasResume ? 'Replace' : 'Upload'}
            </Button>
            {hasResume && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Attached
              </span>
            )}
          </div>
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
            disabled={!hasResume || isUploading}
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
