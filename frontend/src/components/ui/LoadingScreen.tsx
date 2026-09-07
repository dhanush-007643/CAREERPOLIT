import React from 'react';

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Analyzing your career intelligence profile...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
        <div className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-b-violet-400 animate-spin absolute" />
        <span className="text-violet-400 font-bold text-lg absolute">✦</span>
      </div>
      <p className="text-sm font-semibold text-slate-200">{message}</p>
      <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
        <span className="flex items-center gap-1 text-emerald-400">✓ Skills</span>
        <span className="flex items-center gap-1 text-sky-400">✓ Resume</span>
        <span className="flex items-center gap-1 text-violet-400">◌ AI Matching</span>
      </div>
    </div>
  );
};
