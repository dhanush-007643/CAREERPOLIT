import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Globe, Lock, DollarSign, Plus, Check } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { jobApi } from '../../api/jobApi';
import { useToast } from '../../context/ToastContext';

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [location, setLocation] = useState('San Francisco, CA (Remote)');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [minSalary, setMinSalary] = useState('75000');
  const [maxSalary, setMaxSalary] = useState('100000');
  const [minExp, setMinExp] = useState('0');
  const [maxExp, setMaxExp] = useState('2');

  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['React', 'Node.js', 'MongoDB']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      toastError('Skills Required', 'Please specify at least one required skill.');
      return;
    }

    setIsSubmitting(true);
    try {
      await jobApi.create({
        title,
        workMode: workMode as any,
        employmentType: employmentType as any,
        location,
        description,
        requiredSkills,
        visibility,
        experience: {
          minYears: Number(minExp),
          maxYears: Number(maxExp),
        },
        salaryRange: {
          min: Number(minSalary),
          max: Number(maxSalary),
          currency: 'USD',
          isNegotiable: true,
        },
      });

      success('Job Posted Successfully', `${title} is now active and receiving AI matches!`);
      navigate('/startup/jobs');
    } catch (err: any) {
      toastError('Submission Failed', err.response?.data?.message || 'Could not create job posting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Post a New Engineering Opportunity
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Define job qualifications and visibility settings to start candidate matching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Specs */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Job Overview
          </h3>

          <Input
            label="Job Title"
            placeholder="e.g. Junior Full Stack Engineer (MERN)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Work Mode"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              options={[
                { value: 'REMOTE', label: 'Remote' },
                { value: 'HYBRID', label: 'Hybrid' },
                { value: 'ON_SITE', label: 'On-Site' },
              ]}
            />
            <Select
              label="Employment Type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              options={[
                { value: 'FULL_TIME', label: 'Full Time' },
                { value: 'INTERNSHIP', label: 'Internship' },
                { value: 'PART_TIME', label: 'Part Time' },
                { value: 'CONTRACT', label: 'Contract' },
              ]}
            />
            <Input
              label="Location"
              placeholder="e.g. Austin, TX / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
        </GlassCard>

        {/* Required Skills Tagger */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Required Technical Skills
          </h3>

          <div className="flex gap-2">
            <Input
              placeholder="Type skill name (e.g. React, Docker) and press enter..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
            <Button type="button" variant="secondary" size="md" onClick={handleAddSkill}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {requiredSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="hover:text-red-400 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Experience & Salary Range */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Compensation & Experience
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min Exp (Years)"
                type="number"
                min="0"
                max="10"
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
              />
              <Input
                label="Max Exp (Years)"
                type="number"
                min="0"
                max="15"
                value={maxExp}
                onChange={(e) => setMaxExp(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min Salary (USD/yr)"
                type="number"
                step="5000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
              <Input
                label="Max Salary (USD/yr)"
                type="number"
                step="5000"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
              />
            </div>
          </div>
        </GlassCard>

        {/* Visibility Setting */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Listing Visibility
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              onClick={() => setVisibility('PUBLIC')}
              className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                visibility === 'PUBLIC'
                  ? 'bg-sky-500/15 border-sky-400 text-sky-200'
                  : 'bg-slate-900/40 border-white/5 text-slate-400'
              }`}
            >
              <Globe className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-slate-100">Public Opportunity</span>
                <span className="text-[11px] text-slate-400">
                  Discoverable by all eligible candidates across the CareerPilot network.
                </span>
              </div>
            </label>

            <label
              onClick={() => setVisibility('PRIVATE')}
              className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                visibility === 'PRIVATE'
                  ? 'bg-amber-500/15 border-amber-400 text-amber-200'
                  : 'bg-slate-900/40 border-white/5 text-slate-400'
              }`}
            >
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-slate-100">Private / Invite Only</span>
                <span className="text-[11px] text-slate-400">
                  Accessible only by followed candidates or those sent direct invitations.
                </span>
              </div>
            </label>
          </div>
        </GlassCard>

        {/* Description */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Job Description & Responsibilities
          </h3>
          <textarea
            rows={6}
            placeholder="Outline team mission, daily impact, and tech stack expectations..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 resize-none"
            required
          />
        </GlassCard>

        {/* Action CTAs */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => navigate('/startup/jobs')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Publish Job Opening
          </Button>
        </div>
      </form>
    </div>
  );
};
