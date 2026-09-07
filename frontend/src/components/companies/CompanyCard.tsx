import React, { useState } from 'react';
import { Building2, MapPin, Globe, Users, Briefcase, Plus, Check } from 'lucide-react';
import { Company } from '../../types';
import { Button } from '../ui/Button';
import { companyApi } from '../../api/companyApi';
import { useToast } from '../../context/ToastContext';

interface CompanyCardProps {
  company: Company;
  onViewDetails?: () => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onViewDetails }) => {
  const [isFollowing, setIsFollowing] = useState(company.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: toastError } = useToast();

  React.useEffect(() => {
    setIsFollowing(company.isFollowing || false);
  }, [company.isFollowing]);

  const handleToggleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await companyApi.unfollow(company._id);
        setIsFollowing(false);
        success('Unfollowed', `You unfollowed ${company.companyName}`);
      } else {
        await companyApi.follow(company._id);
        setIsFollowing(true);
        success('Following', `You will now receive job alerts from ${company.companyName}!`);
      }
    } catch (err: any) {
      toastError('Action Failed', err.response?.data?.message || 'Could not update follow status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/10 transition-all flex flex-col justify-between">
      <div>
        {/* Top: Logo & Follow Action */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-bold text-base text-sky-400 overflow-hidden shrink-0 shadow-md">
              {company.logo ? (
                <img src={company.logo} alt={company.companyName} className="w-full h-full object-cover" />
              ) : (
                company.companyName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 hover:text-sky-300 transition-colors">
                {company.companyName}
              </h3>
              <p className="text-xs text-sky-400 font-medium">{company.industry}</p>
            </div>
          </div>

          <Button
            size="sm"
            variant={isFollowing ? 'secondary' : 'outline'}
            isLoading={isLoading}
            leftIcon={isFollowing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
            onClick={handleToggleFollow}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {company.description || company.aboutCompany || 'Leading innovation startup.'}
        </p>

        {/* Meta Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-400 py-2.5 border-y border-slate-800/80 mb-3.5">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" /> {company.location}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" /> {company.companySize || '11-50'} team
          </span>
        </div>

        {/* Tech Stack Pills */}
        {company.technologies && company.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {company.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/70 border border-white/5 text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 flex items-center justify-between">
        {company.website ? (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" /> Website
          </a>
        ) : <span />}

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
          >
            View Profile →
          </button>
        )}
      </div>
    </div>
  );
};
