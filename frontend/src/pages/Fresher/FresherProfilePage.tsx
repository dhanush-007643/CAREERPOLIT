import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Sparkles,
  FileText,
  Upload,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  ExternalLink,
  Award,
} from 'lucide-react';
import { FresherProfile } from '../../types';
import { profileApi } from '../../api/profileApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { useToast } from '../../context/ToastContext';

export const FresherProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<FresherProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { success, error: toastError } = useToast();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [careerInterests, setCareerInterests] = useState<string[]>([]);
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await profileApi.getProfile();
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setFullName(p.fullName || '');
        setPhone(p.phone || '');
        setLocation(p.location || '');
        setSkills(p.skills || []);
        setCareerInterests(p.careerInterests || []);
        setPreferredRoles(p.preferredJobRoles || []);
        setPortfolioUrl(p.portfolioUrl || '');
        setGitHubUrl(p.gitHubUrl || '');
        setLinkedInUrl(p.linkedInUrl || '');
      }
    } catch (err) {
      toastError('Load Error', 'Could not load fresher profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await profileApi.updateProfile({
        fullName,
        phone,
        location,
        skills,
        careerInterests,
        preferredJobRoles: preferredRoles,
        portfolioUrl,
        gitHubUrl,
        linkedInUrl,
      });

      if (res.success && res.data) {
        setProfile(res.data);
        success('Profile Updated', `Profile is now ${res.data.completionPercentage}% complete!`);
      }
    } catch (err: any) {
      toastError('Save Error', err.response?.data?.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await profileApi.uploadResume(file);
      if (res.success && res.data) {
        setProfile(res.data.profile);
        success('Resume Uploaded', 'Resume file processed and stored via Cloudinary.');
      }
    } catch (err: any) {
      toastError('Upload Failed', err.response?.data?.message || 'Could not upload resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your current resume?')) return;
    try {
      const res = await profileApi.deleteResume();
      if (res.success && res.data) {
        setProfile(res.data.profile);
        success('Resume Deleted', 'Resume was removed.');
      }
    } catch (err: any) {
      toastError('Delete Failed', 'Could not delete resume.');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading candidate profile and credentials..." />;
  }

  const completionPercentage = profile?.completionPercentage || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header & Completion Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Candidate Profile & Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain verified education, skill badges, and your Cloudinary-backed resume.
          </p>
        </div>

        {/* Completion Gauge Card */}
        <div className="glass-panel px-5 py-3.5 rounded-2xl border border-white/10 flex items-center gap-4 shadow-glass">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90">
              <circle cx="24" cy="24" r="20" className="stroke-slate-800" strokeWidth="4" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-sky-400 transition-all duration-700"
                strokeWidth="4"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * completionPercentage) / 100}
                fill="none"
              />
            </svg>
            <span className="absolute text-[11px] font-extrabold font-mono text-slate-100">
              {completionPercentage}%
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-100 block">Profile Strength</span>
            <span className="text-[10px] text-slate-400">
              {completionPercentage >= 85 ? 'Strong candidate profile' : 'Add skills & resume to reach 100%'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Info */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={profile?.email || ''}
              disabled
              helperText="Managed by account credentials"
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Current Location"
              type="text"
              placeholder="e.g. San Francisco, CA / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Skills Management */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" /> Technical Skills & Frameworks
          </h3>

          <div>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Type skill (e.g. React, Node.js, Docker) and press enter..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
              />
              <Button type="button" variant="secondary" size="md" onClick={handleAddSkill}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-400 transition-colors ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Resume Management Section */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Resume & Documents
          </h3>

          <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  {profile?.resumeUrl ? 'Primary Resume' : 'No Resume Uploaded'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {profile?.resumeUrl
                    ? 'Uploaded and ready for 1-click job applications.'
                    : 'Supported formats: PDF, DOC, DOCX (Max 10MB)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {profile?.resumeUrl ? (
                <>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 border border-slate-700 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Preview PDF
                  </a>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={handleDeleteResume}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <label className="cursor-pointer">
                  <span className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors">
                    <Upload className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Upload Resume'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Social & Links */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-400" /> Portfolio & Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="GitHub URL"
              type="url"
              placeholder="https://github.com/username"
              value={gitHubUrl}
              onChange={(e) => setGitHubUrl(e.target.value)}
            />
            <Input
              label="LinkedIn URL"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
            />
            <Input
              label="Portfolio / Website"
              type="url"
              placeholder="https://yourportfolio.dev"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
