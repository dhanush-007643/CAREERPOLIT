import React from 'react';
import { Search } from 'lucide-react';

interface JobFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  workMode: string;
  onWorkModeChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  experience: string;
  onExperienceChange: (val: string) => void;
  onReset: () => void;
}

export const JobFilterBar: React.FC<JobFilterBarProps> = ({
  search,
  onSearchChange,
  workMode,
  onWorkModeChange,
  location,
  onLocationChange,
  experience,
  onExperienceChange,
  onReset,
}) => {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between shadow-glass mb-6">
      {/* Keyword Search */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search jobs by title, skills (e.g. React, Node)..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        <select
          value={workMode}
          onChange={(e) => onWorkModeChange(e.target.value)}
          className="glass-input rounded-xl px-3 py-2 text-xs text-slate-200 cursor-pointer"
        >
          <option value="" className="bg-slate-900">All Work Modes</option>
          <option value="REMOTE" className="bg-slate-900">Remote</option>
          <option value="HYBRID" className="bg-slate-900">Hybrid</option>
          <option value="ON_SITE" className="bg-slate-900">On-Site</option>
        </select>

        <select
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value)}
          className="glass-input rounded-xl px-3 py-2 text-xs text-slate-200 cursor-pointer"
        >
          <option value="" className="bg-slate-900">Any Experience</option>
          <option value="0" className="bg-slate-900">Fresher / 0 Yrs</option>
          <option value="1" className="bg-slate-900">1 Year</option>
          <option value="2" className="bg-slate-900">2+ Years</option>
        </select>

        <input
          type="text"
          placeholder="Filter Location..."
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="glass-input rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 w-32"
        />

        {(search || workMode || location || experience) && (
          <button
            onClick={onReset}
            className="text-xs text-sky-400 hover:text-sky-300 px-2 py-1 font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
