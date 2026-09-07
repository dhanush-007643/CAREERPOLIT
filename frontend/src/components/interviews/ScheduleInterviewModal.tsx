import React, { useState } from 'react';
import { Calendar, Clock, Video, Link2, FileText } from 'lucide-react';
import { Application } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { interviewApi } from '../../api/interviewApi';
import { useToast } from '../../context/ToastContext';

interface ScheduleInterviewModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-careerpilot-demo');
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  if (!application) return null;

  const candidateName = application.fresher?.name || 'Candidate';
  const jobTitle = application.job?.title || 'Open Position';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toastError('Date Required', 'Please select an interview date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await interviewApi.schedule({
        applicationId: application._id,
        date: new Date(date).toISOString(),
        time,
        durationMinutes: Number(durationMinutes),
        meetingLink,
        interviewType,
        notes,
      });
      success('Interview Scheduled!', `Interview invitation dispatched to ${candidateName}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Scheduling Failed', err.response?.data?.message || 'Could not schedule interview.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Interview"
      description={`Coordinate a virtual interview with ${candidateName} for ${jobTitle}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Interview Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Interview Time"
            type="text"
            placeholder="e.g. 02:00 PM PST"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Interview Type"
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            options={[
              { value: 'TECHNICAL', label: 'Technical Screening' },
              { value: 'CODING', label: 'Live Coding / System Design' },
              { value: 'HR', label: 'HR / Behavioral' },
              { value: 'MANAGERIAL', label: 'Engineering Manager Round' },
              { value: 'FINAL', label: 'Final Executive Round' },
            ]}
          />
          <Select
            label="Duration"
            value={durationMinutes.toString()}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            options={[
              { value: '30', label: '30 Minutes' },
              { value: '45', label: '45 Minutes' },
              { value: '60', label: '60 Minutes (1 Hour)' },
              { value: '90', label: '90 Minutes' },
            ]}
          />
        </div>

        <Input
          label="Meeting URL (Google Meet / Zoom)"
          type="url"
          leftIcon={<Video className="w-4 h-4" />}
          placeholder="https://meet.google.com/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          required
        />

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Preparation Agenda & Notes
          </label>
          <textarea
            rows={3}
            placeholder="Key topics, portfolio review areas, interviewers present..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            Confirm & Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
