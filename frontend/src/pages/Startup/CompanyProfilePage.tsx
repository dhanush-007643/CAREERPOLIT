import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Users, Save, Sparkles, Plus } from 'lucide-react';
import { Company } from '../../types';
import { companyApi } from '../../api/companyApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { useToast } from '../../context/ToastContext';

export const CompanyProfilePage: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: toastError } = useToast();

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('11-50');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await companyApi.getMyProfile();
      if (res.success && res.data) {
        const c = res.data;
        setCompany(c);
        setCompanyName(c.companyName || '');
        setIndustry(c.industry || '');
        setLocation(c.location || '');
        setWebsite(c.website || '');
        setCompanySize(c.companySize || '11-50');
        setDescription(c.description || c.aboutCompany || '');
        setTechnologies(c.technologies || ['React', 'Node.js', 'TypeScript', 'Docker']);
      }
    } catch (err) {
      console.warn('Company profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await companyApi.updateMyProfile({
        companyName,
        industry,
        location,
        website,
        companySize,
        description,
        technologies,
      });
      if (res.success) {
        success('Profile Saved', 'Company identity and tech stack updated.');
      }
    } catch (err: any) {
      toastError('Save Failed', err.response?.data?.message || 'Could not update company profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading company profile details..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Startup Profile & Employer Brand
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your startup's public profile, culture narrative, and primary engineering stack.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" /> Company Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Industry / Domain"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />
            <Input
              label="Headquarters Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Input
              label="Official Website URL"
              type="url"
              placeholder="https://company.io"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Tech Stack */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" /> Core Tech Stack
          </h3>

          <div className="flex gap-2">
            <Input
              placeholder="Type technology (e.g. Next.js, Kubernetes) and press enter..."
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleAddTech}
            />
            <Button type="button" variant="secondary" size="md" onClick={handleAddTech}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {technologies.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTech(t)}
                  className="hover:text-red-400 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </GlassCard>

        {/* About Company */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            About Company & Mission
          </h3>
          <textarea
            rows={5}
            placeholder="Share your startup's product vision, engineering principles, and team culture..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 resize-none"
          />
        </GlassCard>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
